"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isPosError } from "@/lib/pos/errors";
import {
  allowPinAttempt,
  clearPinAttempts,
  createTerminalStaff,
  findStaffByPin,
  revokeStaffPin,
  setStaffPin,
} from "@/lib/pos/staff";
import { clearActiveStaff, markDeviceAsTill, setActiveStaff } from "@/lib/pos/staff-session";
import { recordAudit } from "@/lib/pos/audit";
import { getSessionContext, requireRole } from "@/lib/session";

/**
 * Staff administration and the till PIN lock.
 *
 * Administration is guarded by the account role (only an owner adds staff or
 * changes a PIN) and never by the PIN lock, so an owner signed in at the till
 * as a waiter does not lose the dashboard.
 */

export type StaffResult = { ok: true } | { ok: false; error: string };

const pinSchema = z.string().trim().regex(/^[0-9]{4,6}$/, "PIN_FORMAT");
const nameSchema = z.string().trim().min(2).max(60);
const roleSchema = z.enum(["MANAGER", "KITCHEN", "FINANCE", "CASHIER", "WAITER"]);
const idSchema = z.string().trim().min(1).max(64);

function failure(error: unknown): StaffResult {
  if (isPosError(error)) return { ok: false, error: error.code };
  if (error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message)) {
    return { ok: false, error: error.message };
  }
  throw error;
}

export async function addStaffAction(name: string, role: string, pin: string): Promise<StaffResult> {
  const parsed = z
    .object({ name: nameSchema, role: roleSchema, pin: pinSchema })
    .safeParse({ name, role, pin });
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  try {
    const ctx = await requireRole("OWNER");
    const restaurantId = ctx.restaurant?.id;
    if (!restaurantId) return { ok: false, error: "NO_WORKSPACE" };

    const staff = await createTerminalStaff(
      restaurantId,
      parsed.data.name,
      parsed.data.role,
      parsed.data.pin,
    );
    await recordAudit({
      restaurantId,
      membershipId: ctx.membershipId,
      action: "STAFF_ADDED",
      entity: "Membership",
      entityId: staff.membershipId,
      meta: { name: parsed.data.name, role: parsed.data.role },
    });

    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function setStaffPinAction(membershipId: string, pin: string): Promise<StaffResult> {
  const parsed = z.object({ membershipId: idSchema, pin: pinSchema }).safeParse({ membershipId, pin });
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  try {
    const ctx = await requireRole("OWNER");
    const restaurantId = ctx.restaurant?.id;
    if (!restaurantId) return { ok: false, error: "NO_WORKSPACE" };

    await setStaffPin(restaurantId, parsed.data.membershipId, parsed.data.pin);
    await recordAudit({
      restaurantId,
      membershipId: ctx.membershipId,
      action: "STAFF_PIN_SET",
      entity: "Membership",
      entityId: parsed.data.membershipId,
    });

    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function revokeStaffPinAction(membershipId: string): Promise<StaffResult> {
  const parsed = idSchema.safeParse(membershipId);
  if (!parsed.success) return { ok: false, error: "INVALID_INPUT" };

  try {
    const ctx = await requireRole("OWNER");
    const restaurantId = ctx.restaurant?.id;
    if (!restaurantId) return { ok: false, error: "NO_WORKSPACE" };

    await revokeStaffPin(restaurantId, parsed.data);
    await recordAudit({
      restaurantId,
      membershipId: ctx.membershipId,
      action: "STAFF_PIN_REVOKED",
      entity: "Membership",
      entityId: parsed.data,
    });

    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

/** Sign a staff member in at the till. */
export async function unlockTerminalAction(pin: string): Promise<StaffResult> {
  const parsed = pinSchema.safeParse(pin);
  if (!parsed.success) return { ok: false, error: "PIN_REJECTED" };

  const ctx = await getSessionContext();
  const restaurantId = ctx?.restaurant?.id;
  if (!ctx) return { ok: false, error: "UNAUTHORIZED" };
  if (!restaurantId) return { ok: false, error: "NO_WORKSPACE" };

  // The lock screen is the other door a PIN opens, so it is counted too.
  const gate = await allowPinAttempt(restaurantId);
  if (!gate.allowed) return { ok: false, error: "TOO_MANY_ATTEMPTS" };

  const match = await findStaffByPin(restaurantId, parsed.data);
  // One message for a wrong PIN and for an unknown one: the screen must not
  // help someone guess which digits were close.
  if (!match) return { ok: false, error: "PIN_REJECTED" };

  await clearPinAttempts(restaurantId);
  await setActiveStaff(match.membershipId);
  await markDeviceAsTill();
  await recordAudit({
    restaurantId,
    membershipId: match.membershipId,
    action: "TERMINAL_UNLOCKED",
    entity: "Membership",
    entityId: match.membershipId,
  });

  revalidatePath("/pos");
  return { ok: true };
}

export async function lockTerminalAction(): Promise<StaffResult> {
  await clearActiveStaff();
  revalidatePath("/pos");
  return { ok: true };
}
