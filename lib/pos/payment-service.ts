import type { PosPaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "./audit";
import { PosError } from "./errors";
import { roundMinor } from "./money";
import { changeFor, remainingDue } from "./pricing";
import { getOrder, recalculateOrder, type OrderWithLines, type PosActor } from "./order-service";
import { projectOrderToSales } from "./projection";
import { issueFiscalReceipt } from "./fiscal/service";

export type TakePaymentInput = {
  method: PosPaymentMethod;
  /** Amount applied to the ticket. Cash tenders above the due are change. */
  amountMinor: number;
  tenderedMinor?: number;
  reference?: string | null;
  shiftId?: string | null;
};

export type FiscalFailure = { code: string; message: string; retryable: boolean };

export type TakePaymentResult = {
  order: OrderWithLines;
  changeMinor: number;
  remainingMinor: number;
  /**
   * Set when the money was taken but the legal receipt did not print. The
   * payment stands - it really was collected - and the ticket stays open until
   * a receipt confirms, because a sale without one is not a closed sale.
   */
  fiscal?: FiscalFailure;
};

const PAYABLE_STATUSES = ["OPEN", "SENT", "PARTIALLY_PAID"] as const;

/**
 * Take one payment against a ticket. Partial payments are the norm: a table
 * splitting the bill produces several rows, and the ticket only closes when the
 * last one lands.
 *
 * NOTE (Faz 7): once the YN OKC integration is in, closing must wait for a
 * CONFIRMED FiscalReceipt instead of closing here. The status transition is
 * deliberately kept in one place so that gate is a single change.
 */
export async function takePayment(
  actor: PosActor,
  orderId: string,
  input: TakePaymentInput,
  now = new Date(),
): Promise<TakePaymentResult> {
  const amountMinor = roundMinor(input.amountMinor);
  if (amountMinor <= 0) throw new PosError("INVALID_INPUT", "Payment must be positive.");

  const taken = await prisma.$transaction(async (tx) => {
    const order = await tx.posOrder.findFirst({
      where: { id: orderId, restaurantId: actor.restaurantId },
      include: { lines: { include: { modifiers: true }, orderBy: { createdAt: "asc" } } },
    });
    if (!order) throw new PosError("ORDER_NOT_FOUND");
    if (!PAYABLE_STATUSES.includes(order.status as (typeof PAYABLE_STATUSES)[number])) {
      throw new PosError("ORDER_CLOSED");
    }

    const dueMinor = remainingDue(order.totalMinor, order.paidMinor);
    if (amountMinor > dueMinor) throw new PosError("PAYMENT_EXCEEDS_DUE");

    const tenderedMinor = input.tenderedMinor ?? amountMinor;
    const changeMinor = input.method === "CASH" ? changeFor(tenderedMinor, amountMinor) : 0;

    await tx.posPayment.create({
      data: {
        restaurantId: actor.restaurantId,
        orderId: order.id,
        shiftId: input.shiftId ?? order.shiftId,
        method: input.method,
        amountMinor,
        tenderedMinor: input.method === "CASH" ? tenderedMinor : null,
        changeMinor,
        reference: input.reference ?? null,
        receivedByMembershipId: actor.membershipId,
        createdAt: now,
      },
    });

    const paidMinor = order.paidMinor + amountMinor;
    const remainingMinor = remainingDue(order.totalMinor, paidMinor);
    const settled = remainingMinor === 0;

    const updated = await tx.posOrder.update({
      where: { id: order.id },
      data: {
        paidMinor,
        // A ticket opened before the shift was, or before anyone opened one, is
        // adopted by the drawer that first takes money for it.
        shiftId: order.shiftId ?? input.shiftId ?? null,
        status: "PARTIALLY_PAID",
      },
      include: { lines: { include: { modifiers: true }, orderBy: { createdAt: "asc" } } },
    });

    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "PAYMENT_TAKEN",
        entity: "PosOrder",
        entityId: order.id,
        meta: { method: input.method, amountMinor, remainingMinor },
      },
      tx,
    );

    return { order: updated, changeMinor, remainingMinor, settled };
  });

  if (!taken.settled) {
    return { order: taken.order, changeMinor: taken.changeMinor, remainingMinor: taken.remainingMinor };
  }

  const closed = await closeSettledOrder(actor, taken.order, now);
  return { ...closed, changeMinor: taken.changeMinor, remainingMinor: 0 };
}

/**
 * Close a fully paid ticket.
 *
 * Split out so it can be retried on its own: when the fiscal device refuses,
 * the money is already recorded and only this half has to be attempted again.
 */
export async function closeSettledOrder(
  actor: PosActor,
  order: OrderWithLines,
  now = new Date(),
): Promise<{ order: OrderWithLines; fiscal?: FiscalFailure }> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: actor.restaurantId },
    select: { fiscalProvider: true },
  });

  if (restaurant?.fiscalProvider) {
    const receipt = await issueFiscalReceipt(order, restaurant.fiscalProvider, now);
    if (!receipt.ok) {
      await recordAudit({
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "FISCAL_FAILED",
        entity: "PosOrder",
        entityId: order.id,
        meta: { code: receipt.code, message: receipt.message },
      });
      // Deliberately left open. A ticket marked paid with no fiscal receipt is
      // the one state an inspection would find, and the cashier can retry.
      return {
        order,
        fiscal: { code: receipt.code, message: receipt.message, retryable: receipt.retryable },
      };
    }
  }

  const closed = await prisma.$transaction(async (tx) => {
    const updated = await tx.posOrder.update({
      where: { id: order.id },
      data: { status: "PAID", closedAt: now, closedByMembershipId: actor.membershipId },
      include: { lines: { include: { modifiers: true }, orderBy: { createdAt: "asc" } } },
    });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "ORDER_SETTLED",
        entity: "PosOrder",
        entityId: order.id,
        meta: { totalMinor: updated.totalMinor },
      },
      tx,
    );
    await projectOrderToSales(tx, updated, now);
    await queueReceipt(tx, updated);
    return updated;
  });

  return { order: closed };
}

/** Hand the ticket to the local bridge to print. Hardware is never driven from here. */
async function queueReceipt(tx: Prisma.TransactionClient, order: OrderWithLines): Promise<void> {
  const [restaurant, table] = await Promise.all([
    tx.restaurant.findUnique({ where: { id: order.restaurantId }, select: { name: true, currency: true } }),
    order.tableId
      ? tx.posTable.findUnique({ where: { id: order.tableId }, select: { name: true } })
      : Promise.resolve(null),
  ]);

  await tx.posPrintJob.create({
    data: {
      restaurantId: order.restaurantId,
      kind: "RECEIPT",
      payload: {
        venue: restaurant?.name ?? "",
        currency: restaurant?.currency ?? "TRY",
        orderCode: order.code,
        table: table?.name ?? order.channel,
        closedAt: order.closedAt?.toISOString() ?? null,
        totalMinor: order.totalMinor,
        taxMinor: order.taxMinor,
        discountMinor: order.discountMinor,
        lines: order.lines
          .filter((line) => line.status !== "VOID")
          .map((line) => ({
            name: line.name,
            quantity: line.quantity,
            lineTotalMinor: line.lineTotalMinor,
          })),
      },
    },
  });
}

/** Reopen a settled ticket. Used when a payment was rung on the wrong table. */
export async function voidOrder(
  actor: PosActor,
  orderId: string,
  reason: string,
): Promise<OrderWithLines> {
  if (!reason.trim()) throw new PosError("INVALID_INPUT", "A void needs a reason.");

  return prisma.$transaction(async (tx) => {
    const order = await tx.posOrder.findFirst({
      where: { id: orderId, restaurantId: actor.restaurantId },
    });
    if (!order) throw new PosError("ORDER_NOT_FOUND");

    // Whatever was projected into the engine must go with it, or the variance
    // report keeps counting a ticket that no longer exists.
    await tx.sale.deleteMany({ where: { posOrderId: order.id } });
    await tx.posOrderLine.updateMany({
      where: { orderId: order.id },
      data: { status: "VOID", voidReason: reason.trim(), voidedByMembershipId: actor.membershipId },
    });
    await tx.posOrder.update({
      where: { id: order.id },
      data: { status: "VOID", closedAt: new Date(), closedByMembershipId: actor.membershipId },
    });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "ORDER_VOIDED",
        entity: "PosOrder",
        entityId: order.id,
        meta: { reason: reason.trim(), totalMinor: order.totalMinor },
      },
      tx,
    );

    return recalculateOrder(tx, order.id);
  });
}

export async function getOrderWithDue(
  actor: PosActor,
  orderId: string,
): Promise<{ order: OrderWithLines; dueMinor: number }> {
  const order = await getOrder(actor, orderId);
  return { order, dueMinor: remainingDue(order.totalMinor, order.paidMinor) };
}
