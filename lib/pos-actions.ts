"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionContext, type RoleType } from "@/lib/session";
import { getActiveStaff } from "@/lib/pos/staff-session";
import { isPosError, PosError, type PosErrorCode } from "@/lib/pos/errors";
import type { PosActor } from "@/lib/pos/order-service";
import * as orders from "@/lib/pos/order-service";
import * as payments from "@/lib/pos/payment-service";
import * as shifts from "@/lib/pos/shift-service";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/pos/audit";
import { enrolDevice } from "@/lib/pos/bridge-auth";
import {
  allowPinAttempt,
  APPROVER_ROLES,
  clearPinAttempts,
  findApprover,
} from "@/lib/pos/staff";
import { advanceLines } from "@/lib/pos/kds-service";
import { currentShift } from "@/lib/pos/shift-service";
import { setupTerminalWorkspace } from "@/lib/pos/setup";

/**
 * Server action layer for the POS terminal.
 *
 * Same contract as lib/expense-actions.ts: validate with zod, authorise with
 * requireRole, guard on restaurantId, revalidate. Failures come back as codes
 * rather than sentences so the terminal can render them in en/tr/ar (see
 * lib/pos/messages.ts).
 */

export type PosFailure =
  | PosErrorCode
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NO_WORKSPACE";

export type PosActionResult<T> = { ok: true; data: T } | { ok: false; error: PosFailure };

const POS_PATHS = ["/pos", "/pos/kds", "/pos/shift"];

function revalidatePos() {
  for (const path of POS_PATHS) revalidatePath(path);
}

/**
 * Who is acting at the till.
 *
 * The browser session proves the restaurant is authenticated; the PIN lock
 * proves who is standing at the screen. When someone is signed in with a PIN it
 * is their membership that every ticket is attributed to and their role that
 * decides what is allowed - so a waiter on the owner's logged-in tablet cannot
 * void a line. With no PIN set up anywhere the account's own membership is used,
 * which is what a single-operator venue wants.
 */
async function actorFor(...allowed: RoleType[]): Promise<PosActor> {
  const ctx = await getSessionContext();
  if (!ctx) throw new Error("UNAUTHORIZED");

  const restaurantId = ctx.restaurant?.id;
  if (!restaurantId) throw new Error("NO_WORKSPACE");

  const staff = await getActiveStaff(restaurantId);
  const membershipId = staff?.membershipId ?? ctx.membershipId;
  const role = staff?.role ?? ctx.role;
  if (!membershipId) throw new Error("NO_WORKSPACE");

  if (allowed.length > 0 && (!role || !allowed.includes(role))) throw new Error("FORBIDDEN");
  return { restaurantId, membershipId };
}

async function run<T>(work: () => Promise<T>): Promise<PosActionResult<T>> {
  try {
    const data = await work();
    revalidatePos();
    return { ok: true, data };
  } catch (error) {
    if (isPosError(error)) return { ok: false, error: error.code };
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { ok: false, error: "UNAUTHORIZED" };
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { ok: false, error: "FORBIDDEN" };
    }
    if (error instanceof Error && error.message === "NO_WORKSPACE") {
      return { ok: false, error: "NO_WORKSPACE" };
    }
    throw error;
  }
}

const id = z.string().trim().min(1).max(64);
const approvalPinSchema = z.string().trim().regex(/^[0-9]{4,6}$/).nullish();

export type WriteOffApproval = { actor: PosActor; approvedBy: string | null; requestedBy: string | null };

/**
 * Who is signing off a void, a comp or a discount.
 *
 * A waiter cannot write money off on their own, but service does not stop while
 * they fetch someone: a manager types their PIN on the spot and the write-off is
 * recorded against the manager, with the person who asked for it kept alongside.
 * A waiter's own PIN can never approve their own void.
 */
async function actorForWriteOff(approvalPin?: string | null): Promise<WriteOffApproval> {
  const ctx = await getSessionContext();
  if (!ctx) throw new Error("UNAUTHORIZED");

  const restaurantId = ctx.restaurant?.id;
  if (!restaurantId) throw new Error("NO_WORKSPACE");

  const staff = await getActiveStaff(restaurantId);
  const role = staff?.role ?? ctx.role;
  const membershipId = staff?.membershipId ?? ctx.membershipId;

  if (role && APPROVER_ROLES.includes(role)) {
    if (!membershipId) throw new Error("NO_WORKSPACE");
    return { actor: { restaurantId, membershipId }, approvedBy: null, requestedBy: null };
  }

  if (!approvalPin) throw new PosError("APPROVAL_REQUIRED");

  // Counted before the PIN is checked, so a wrong guess costs an attempt.
  const gate = await allowPinAttempt(restaurantId);
  if (!gate.allowed) throw new PosError("TOO_MANY_ATTEMPTS");

  const approver = await findApprover(restaurantId, approvalPin);
  if (!approver) throw new PosError("APPROVAL_REJECTED");
  await clearPinAttempts(restaurantId);

  return {
    actor: { restaurantId, membershipId: approver.membershipId },
    approvedBy: approver.name,
    requestedBy: membershipId ?? null,
  };
}

/** Leaves a trail when one person authorised what another person asked for. */
async function recordApproval(
  approval: WriteOffApproval,
  action: string,
  entity: string,
  entityId: string,
): Promise<void> {
  if (!approval.approvedBy) return;
  await recordAudit({
    restaurantId: approval.actor.restaurantId,
    membershipId: approval.actor.membershipId,
    action: "WRITE_OFF_APPROVED",
    entity,
    entityId,
    meta: { action, approvedBy: approval.approvedBy, requestedBy: approval.requestedBy },
  });
}
const reason = z.string().trim().min(1).max(200);
const minorAmount = z.coerce.number().int().min(0).max(100_000_000);

const openOrderSchema = z.object({
  clientOrderId: z.string().trim().min(8).max(64),
  tableId: id.nullish(),
  channel: z.string().trim().min(1).max(32).optional(),
  guestCount: z.coerce.number().int().min(1).max(200).optional(),
  note: z.string().trim().max(200).nullish(),
});

export async function openOrderAction(input: unknown) {
  const parsed = openOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "CASHIER", "WAITER");
    const shift = await currentShift(actor.restaurantId);
    return orders.openOrder(actor, { ...parsed.data, shiftId: shift?.id ?? null });
  });
}

const addLinesSchema = z.object({
  orderId: id,
  items: z
    .array(
      z.object({
        productId: id,
        clientLineId: z.string().trim().min(8).max(64).nullish(),
        quantity: z.coerce.number().int().min(1).max(999),
        note: z.string().trim().max(200).nullish(),
        modifierIds: z.array(id).max(20).optional(),
      }),
    )
    .min(1)
    .max(100),
});

export async function addLinesAction(input: unknown) {
  const parsed = addLinesSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "CASHIER", "WAITER");
    return orders.addLines(actor, parsed.data.orderId, parsed.data.items);
  });
}

export async function sendToKitchenAction(orderId: string) {
  const parsed = id.safeParse(orderId);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "CASHIER", "WAITER");
    return orders.sendToKitchen(actor, parsed.data);
  });
}

export async function moveOrderAction(orderId: string, tableId: string | null) {
  const parsed = z.object({ orderId: id, tableId: id.nullable() }).safeParse({ orderId, tableId });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "CASHIER", "WAITER");
    return orders.moveOrderToTable(actor, parsed.data.orderId, parsed.data.tableId);
  });
}

// Voids, comps and discounts are money leaving the till. They need a manager,
// they need a reason, and every one of them is written to PosAuditLog.

export async function voidLineAction(lineId: string, why: string, approvalPin?: string | null) {
  const parsed = z
    .object({ lineId: id, why: reason, approvalPin: approvalPinSchema })
    .safeParse({ lineId, why, approvalPin });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const approval = await actorForWriteOff(parsed.data.approvalPin);
    const order = await orders.voidLine(approval.actor, parsed.data.lineId, parsed.data.why);
    await recordApproval(approval, "LINE_VOIDED", "PosOrderLine", parsed.data.lineId);
    return order;
  });
}

export async function compLineAction(lineId: string, why: string, approvalPin?: string | null) {
  const parsed = z
    .object({ lineId: id, why: reason, approvalPin: approvalPinSchema })
    .safeParse({ lineId, why, approvalPin });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const approval = await actorForWriteOff(parsed.data.approvalPin);
    const order = await orders.compLine(approval.actor, parsed.data.lineId, parsed.data.why);
    await recordApproval(approval, "LINE_COMPED", "PosOrderLine", parsed.data.lineId);
    return order;
  });
}

export async function setLineDiscountAction(
  lineId: string,
  discountMinor: number,
  approvalPin?: string | null,
) {
  const parsed = z
    .object({ lineId: id, discountMinor: minorAmount, approvalPin: approvalPinSchema })
    .safeParse({ lineId, discountMinor, approvalPin });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const approval = await actorForWriteOff(parsed.data.approvalPin);
    const order = await orders.setLineDiscount(
      approval.actor,
      parsed.data.lineId,
      parsed.data.discountMinor,
    );
    await recordApproval(approval, "LINE_DISCOUNTED", "PosOrderLine", parsed.data.lineId);
    return order;
  });
}

export async function setOrderDiscountAction(
  orderId: string,
  discountMinor: number,
  approvalPin?: string | null,
) {
  const parsed = z
    .object({ orderId: id, discountMinor: minorAmount, approvalPin: approvalPinSchema })
    .safeParse({ orderId, discountMinor, approvalPin });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const approval = await actorForWriteOff(parsed.data.approvalPin);
    const order = await orders.setOrderDiscount(
      approval.actor,
      parsed.data.orderId,
      parsed.data.discountMinor,
    );
    await recordApproval(approval, "ORDER_DISCOUNTED", "PosOrder", parsed.data.orderId);
    return order;
  });
}

const paymentSchema = z.object({
  orderId: id,
  method: z.enum(["CASH", "CARD", "MEAL_CARD", "ONLINE", "ON_ACCOUNT"]),
  amountMinor: z.coerce.number().int().min(1).max(100_000_000),
  tenderedMinor: z.coerce.number().int().min(0).max(100_000_000).optional(),
  reference: z.string().trim().max(120).nullish(),
});

export async function takePaymentAction(input: unknown) {
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "CASHIER");
    const { orderId, ...payment } = parsed.data;
    const shift = await currentShift(actor.restaurantId);
    return payments.takePayment(actor, orderId, { ...payment, shiftId: shift?.id ?? null });
  });
}

export async function voidOrderAction(orderId: string, why: string) {
  const parsed = z.object({ orderId: id, why: reason }).safeParse({ orderId, why });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER");
    return payments.voidOrder(actor, parsed.data.orderId, parsed.data.why);
  });
}

export async function openShiftAction(openingCashMinor: number, deviceId?: string | null) {
  const parsed = z
    .object({ openingCashMinor: minorAmount, deviceId: id.nullish() })
    .safeParse({ openingCashMinor, deviceId });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "CASHIER");
    return shifts.openShift(actor, parsed.data);
  });
}

export async function closeShiftAction(shiftId: string, countedCashMinor: number, note?: string) {
  const parsed = z
    .object({ shiftId: id, countedCashMinor: minorAmount, note: z.string().trim().max(200).optional() })
    .safeParse({ shiftId, countedCashMinor, note });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "CASHIER");
    return shifts.closeShift(actor, parsed.data.shiftId, parsed.data.countedCashMinor, parsed.data.note);
  });
}

export async function addCashMovementAction(
  shiftId: string,
  type: "PAID_IN" | "PAID_OUT",
  amountMinor: number,
  why: string,
) {
  const parsed = z
    .object({
      shiftId: id,
      type: z.enum(["PAID_IN", "PAID_OUT"]),
      amountMinor: z.coerce.number().int().min(1).max(100_000_000),
      why: reason,
    })
    .safeParse({ shiftId, type, amountMinor, why });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "CASHIER");
    return shifts.addCashMovement(
      actor,
      parsed.data.shiftId,
      parsed.data.type,
      parsed.data.amountMinor,
      parsed.data.why,
    );
  });
}

/** First-run: build a floor plan and a menu so the terminal has something to show. */
export async function setupTerminalAction() {
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER");
    return setupTerminalWorkspace(actor.restaurantId);
  });
}

/**
 * Kitchen display. KITCHEN is included here and nowhere else: a cook advances
 * lines, but never touches money, discounts or the floor plan.
 */
export async function advanceKitchenLinesAction(
  lineIds: string[],
  to: "PREPARING" | "READY" | "SERVED",
) {
  const parsed = z
    .object({ lineIds: z.array(id).min(1).max(100), to: z.enum(["PREPARING", "READY", "SERVED"]) })
    .safeParse({ lineIds, to });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER", "MANAGER", "KITCHEN");
    return advanceLines(actor, parsed.data.lineIds, parsed.data.to);
  });
}

/**
 * Terminal hardware enrolment. The token is returned exactly once, here: it is
 * stored only as a digest, so a lost token is re-issued by enrolling again, not
 * by looking it up.
 */
export async function registerPosDeviceAction(name: string, kind: string) {
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(60),
      kind: z.enum(["TERMINAL", "BRIDGE", "KDS", "HANDHELD"]),
    })
    .safeParse({ name, kind });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER");
    const device = await enrolDevice(actor.restaurantId, parsed.data.name, parsed.data.kind);
    await recordAudit({
      restaurantId: actor.restaurantId,
      membershipId: actor.membershipId,
      action: "DEVICE_ENROLLED",
      entity: "PosDevice",
      entityId: device.deviceId,
      meta: { name: parsed.data.name, kind: parsed.data.kind },
    });
    return device;
  });
}

export async function revokePosDeviceAction(deviceId: string) {
  const parsed = id.safeParse(deviceId);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" as const };
  return run(async () => {
    const actor = await actorFor("OWNER");
    const result = await prisma.posDevice.updateMany({
      where: { id: parsed.data, restaurantId: actor.restaurantId },
      data: { active: false },
    });
    if (result.count === 0) throw new PosError("INVALID_INPUT", "Device not found.");
    await recordAudit({
      restaurantId: actor.restaurantId,
      membershipId: actor.membershipId,
      action: "DEVICE_REVOKED",
      entity: "PosDevice",
      entityId: parsed.data,
    });
    return { revoked: true };
  });
}
