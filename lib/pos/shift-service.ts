import type { PosCashMovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "./audit";
import { PosError } from "./errors";
import { roundMinor } from "./money";
import type { PosActor } from "./order-service";

export type ShiftSummary = {
  shiftId: string;
  orderCount: number;
  grossMinor: number;
  byMethod: { method: string; amountMinor: number; count: number }[];
  cashPaymentsMinor: number;
  paidInMinor: number;
  paidOutMinor: number;
  openingCashMinor: number;
  expectedCashMinor: number;
};

export async function currentShift(restaurantId: string) {
  return prisma.posShift.findFirst({
    where: { restaurantId, status: "OPEN" },
    orderBy: { openedAt: "desc" },
  });
}

export async function openShift(
  actor: PosActor,
  input: { deviceId?: string | null; openingCashMinor?: number },
  now = new Date(),
) {
  const existing = await currentShift(actor.restaurantId);
  if (existing) throw new PosError("SHIFT_ALREADY_OPEN");

  const openingCashMinor = Math.max(0, roundMinor(input.openingCashMinor ?? 0));

  return prisma.$transaction(async (tx) => {
    const shift = await tx.posShift.create({
      data: {
        restaurantId: actor.restaurantId,
        deviceId: input.deviceId ?? null,
        openingCashMinor,
        openedByMembershipId: actor.membershipId,
        openedAt: now,
      },
    });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "SHIFT_OPENED",
        entity: "PosShift",
        entityId: shift.id,
        meta: { openingCashMinor },
      },
      tx,
    );
    return shift;
  });
}

export async function addCashMovement(
  actor: PosActor,
  shiftId: string,
  type: PosCashMovementType,
  amountMinor: number,
  reason: string,
) {
  const amount = roundMinor(amountMinor);
  if (amount <= 0) throw new PosError("INVALID_INPUT", "Amount must be positive.");
  if (!reason.trim()) throw new PosError("INVALID_INPUT", "A cash movement needs a reason.");

  return prisma.$transaction(async (tx) => {
    const shift = await tx.posShift.findFirst({
      where: { id: shiftId, restaurantId: actor.restaurantId, status: "OPEN" },
    });
    if (!shift) throw new PosError("SHIFT_NOT_OPEN");

    const movement = await tx.posCashMovement.create({
      data: {
        shiftId,
        type,
        amountMinor: amount,
        reason: reason.trim(),
        createdByMembershipId: actor.membershipId,
      },
    });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "CASH_MOVEMENT",
        entity: "PosCashMovement",
        entityId: movement.id,
        meta: { type, amountMinor: amount, reason: reason.trim() },
      },
      tx,
    );
    return movement;
  });
}

/**
 * What the drawer should hold: what it started with, plus the cash actually
 * applied to tickets, plus paid-ins, minus paid-outs. Change given back is
 * already excluded because a payment records the amount applied, not the
 * amount tendered.
 */
export async function summariseShift(restaurantId: string, shiftId: string): Promise<ShiftSummary> {
  const shift = await prisma.posShift.findFirst({ where: { id: shiftId, restaurantId } });
  if (!shift) throw new PosError("SHIFT_NOT_OPEN");

  const [byMethod, movements, paidOrders] = await Promise.all([
    prisma.posPayment.groupBy({
      by: ["method"],
      where: { shiftId },
      _sum: { amountMinor: true },
      _count: { _all: true },
    }),
    prisma.posCashMovement.groupBy({
      by: ["type"],
      where: { shiftId },
      _sum: { amountMinor: true },
    }),
    prisma.posPayment.findMany({ where: { shiftId }, distinct: ["orderId"], select: { orderId: true } }),
  ]);

  const sumFor = (type: PosCashMovementType) =>
    movements.find((m) => m.type === type)?._sum.amountMinor ?? 0;

  const cashPaymentsMinor = byMethod.find((m) => m.method === "CASH")?._sum.amountMinor ?? 0;
  const paidInMinor = sumFor("PAID_IN");
  const paidOutMinor = sumFor("PAID_OUT");

  return {
    shiftId,
    orderCount: paidOrders.length,
    grossMinor: byMethod.reduce((sum, m) => sum + (m._sum.amountMinor ?? 0), 0),
    byMethod: byMethod.map((m) => ({
      method: m.method,
      amountMinor: m._sum.amountMinor ?? 0,
      count: m._count._all,
    })),
    cashPaymentsMinor,
    paidInMinor,
    paidOutMinor,
    openingCashMinor: shift.openingCashMinor,
    expectedCashMinor: shift.openingCashMinor + cashPaymentsMinor + paidInMinor - paidOutMinor,
  };
}

export async function closeShift(
  actor: PosActor,
  shiftId: string,
  countedCashMinor: number,
  note?: string | null,
  now = new Date(),
) {
  const counted = Math.max(0, roundMinor(countedCashMinor));

  // An unpaid ticket left on a closed shift is money that never gets counted.
  const stillOpen = await prisma.posOrder.count({
    where: { restaurantId: actor.restaurantId, status: { in: ["OPEN", "SENT", "PARTIALLY_PAID"] } },
  });
  if (stillOpen > 0) throw new PosError("ORDER_UNPAID");

  const summary = await summariseShift(actor.restaurantId, shiftId);

  return prisma.$transaction(async (tx) => {
    const shift = await tx.posShift.update({
      where: { id: shiftId },
      data: {
        status: "CLOSED",
        expectedCashMinor: summary.expectedCashMinor,
        countedCashMinor: counted,
        differenceMinor: counted - summary.expectedCashMinor,
        note: note ?? null,
        closedByMembershipId: actor.membershipId,
        closedAt: now,
      },
    });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "SHIFT_CLOSED",
        entity: "PosShift",
        entityId: shiftId,
        meta: {
          expectedCashMinor: summary.expectedCashMinor,
          countedCashMinor: counted,
          differenceMinor: counted - summary.expectedCashMinor,
        },
      },
      tx,
    );
    return shift;
  });
}
