import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "./audit";
import { businessDayFor } from "./business-day";
import { PosError } from "./errors";
import { clampMinor, roundMinor } from "./money";
import { priceOrder } from "./pricing";

export type PosActor = {
  restaurantId: string;
  membershipId: string;
};

const EDITABLE_STATUSES = ["OPEN", "SENT", "PARTIALLY_PAID"] as const;
type EditableStatus = (typeof EDITABLE_STATUSES)[number];

const orderWithLines = {
  lines: { include: { modifiers: true }, orderBy: { createdAt: "asc" } },
} satisfies Prisma.PosOrderInclude;

export type OrderWithLines = Prisma.PosOrderGetPayload<{ include: typeof orderWithLines }>;

type Tx = Prisma.TransactionClient;

/**
 * Reprice an order from its stored lines and write the rollups back.
 *
 * Only inputs are read from the line rows (quantity, unit price, line-level
 * discount, modifiers); lineTotalMinor is a derived column. That is what lets
 * this run after every edit without an order-level discount compounding on
 * each pass.
 */
export async function recalculateOrder(tx: Tx, orderId: string): Promise<OrderWithLines> {
  const order = await tx.posOrder.findUnique({ where: { id: orderId }, include: orderWithLines });
  if (!order) throw new PosError("ORDER_NOT_FOUND");

  const priced = priceOrder({
    lines: order.lines.map((line) => ({
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor,
      taxRatePct: line.taxRatePct,
      modifiers: line.modifiers.map((m) => ({ priceMinor: m.priceMinor, quantity: m.quantity })),
      discountMinor: line.discountMinor,
      isComped: line.isComped,
      isVoid: line.status === "VOID",
    })),
    orderDiscountMinor: order.orderDiscountMinor,
  });

  await Promise.all(
    order.lines.map((line, i) =>
      tx.posOrderLine.update({
        where: { id: line.id },
        data: {
          modifiersMinor: priced.lines[i].modifiersMinor,
          lineTotalMinor: priced.lines[i].lineTotalMinor,
        },
      }),
    ),
  );

  return tx.posOrder.update({
    where: { id: orderId },
    data: {
      subtotalMinor: priced.subtotalMinor,
      discountMinor: priced.discountMinor,
      serviceMinor: priced.serviceMinor,
      taxMinor: priced.taxMinor,
      totalMinor: priced.totalMinor,
    },
    include: orderWithLines,
  });
}

async function loadEditableOrder(tx: Tx, actor: PosActor, orderId: string): Promise<OrderWithLines> {
  const order = await tx.posOrder.findFirst({
    where: { id: orderId, restaurantId: actor.restaurantId },
    include: orderWithLines,
  });
  if (!order) throw new PosError("ORDER_NOT_FOUND");
  if (!EDITABLE_STATUSES.includes(order.status as EditableStatus)) {
    throw new PosError("ORDER_CLOSED");
  }
  return order;
}

async function nextTicketCode(tx: Tx, restaurantId: string, businessDay: Date): Promise<number> {
  const highest = await tx.posOrder.aggregate({
    where: { restaurantId, businessDay },
    _max: { code: true },
  });
  return (highest._max.code ?? 0) + 1;
}

export type OpenOrderInput = {
  clientOrderId: string;
  tableId?: string | null;
  channel?: string;
  guestCount?: number;
  note?: string | null;
  shiftId?: string | null;
};

export async function openOrder(
  actor: PosActor,
  input: OpenOrderInput,
  now = new Date(),
): Promise<OrderWithLines> {
  // Idempotency first: a terminal that retried after a dropped response must
  // get back the ticket it already created, not a second one.
  const existing = await prisma.posOrder.findUnique({
    where: { clientOrderId: input.clientOrderId },
    include: orderWithLines,
  });
  if (existing) {
    if (existing.restaurantId !== actor.restaurantId) throw new PosError("ORDER_NOT_FOUND");
    return existing;
  }

  if (input.tableId) {
    const table = await prisma.posTable.findFirst({
      where: { id: input.tableId, restaurantId: actor.restaurantId, active: true },
    });
    if (!table) throw new PosError("TABLE_NOT_FOUND");
  }

  const businessDay = businessDayFor(now);

  // The unique (restaurantId, businessDay, code) index is the real guard against
  // two terminals grabbing the same ticket number; this only retries the read.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const order = await tx.posOrder.create({
          data: {
            restaurantId: actor.restaurantId,
            clientOrderId: input.clientOrderId,
            code: await nextTicketCode(tx, actor.restaurantId, businessDay),
            businessDay,
            tableId: input.tableId ?? null,
            shiftId: input.shiftId ?? null,
            channel: input.channel ?? "Dine-in",
            guestCount: input.guestCount ?? 1,
            note: input.note ?? null,
            openedByMembershipId: actor.membershipId,
            openedAt: now,
          },
          include: orderWithLines,
        });
        await recordAudit(
          {
            restaurantId: actor.restaurantId,
            membershipId: actor.membershipId,
            action: "ORDER_OPENED",
            entity: "PosOrder",
            entityId: order.id,
            meta: { code: order.code, tableId: order.tableId },
          },
          tx,
        );
        return order;
      });
    } catch (error) {
      const isCodeClash =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isCodeClash || attempt === 4) throw error;
    }
  }

  throw new PosError("INVALID_INPUT", "Could not allocate a ticket number.");
}

export type AddLineInput = {
  productId: string;
  quantity: number;
  note?: string | null;
  modifierIds?: readonly string[];
  /** Terminal-generated. Replaying the same id adds nothing. */
  clientLineId?: string | null;
};

export async function addLines(
  actor: PosActor,
  orderId: string,
  items: readonly AddLineInput[],
): Promise<OrderWithLines> {
  if (items.length === 0) throw new PosError("INVALID_INPUT", "No items given.");

  return prisma.$transaction(async (tx) => {
    await loadEditableOrder(tx, actor, orderId);

    // An outbox flushed after a reconnect may resend lines the server already
    // has. Dropping the ones it knows keeps a replay from doubling the ticket.
    const clientLineIds = items.map((item) => item.clientLineId).filter((id): id is string => !!id);
    const alreadyStored = clientLineIds.length
      ? new Set(
          (
            await tx.posOrderLine.findMany({
              where: { clientLineId: { in: clientLineIds } },
              select: { clientLineId: true },
            })
          ).map((line) => line.clientLineId as string),
        )
      : new Set<string>();

    const pendingItems = items.filter(
      (item) => !item.clientLineId || !alreadyStored.has(item.clientLineId),
    );
    if (pendingItems.length === 0) return recalculateOrder(tx, orderId);

    const products = await tx.posProduct.findMany({
      where: {
        id: { in: [...new Set(pendingItems.map((i) => i.productId))] },
        restaurantId: actor.restaurantId,
        active: true,
      },
      include: { category: true, taxGroup: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const modifierIds = [...new Set(pendingItems.flatMap((i) => i.modifierIds ?? []))];
    const modifiers = modifierIds.length
      ? await tx.posModifier.findMany({
          where: {
            id: { in: modifierIds },
            active: true,
            group: { restaurantId: actor.restaurantId },
          },
        })
      : [];
    const modifierById = new Map(modifiers.map((m) => [m.id, m]));

    for (const item of pendingItems) {
      const product = byId.get(item.productId);
      if (!product) throw new PosError("PRODUCT_NOT_FOUND");

      const quantity = Math.trunc(item.quantity);
      if (quantity < 1) throw new PosError("INVALID_INPUT", "Quantity must be at least 1.");

      const chosen = (item.modifierIds ?? []).map((id) => {
        const modifier = modifierById.get(id);
        if (!modifier) throw new PosError("MODIFIER_NOT_FOUND");
        return modifier;
      });

      await tx.posOrderLine.create({
        data: {
          orderId,
          clientLineId: item.clientLineId ?? null,
          productId: product.id,
          // Snapshot: the ticket must survive the product being renamed or
          // repriced later in the same evening.
          menuItemExtId: product.menuItemExtId,
          name: product.name,
          station: product.category.station,
          quantity,
          unitPriceMinor: product.priceMinor,
          taxRatePct: product.taxGroup?.ratePct ?? 10,
          note: item.note ?? null,
          modifiers: {
            create: chosen.map((modifier) => ({
              modifierId: modifier.id,
              name: modifier.name,
              priceMinor: modifier.priceMinor,
            })),
          },
        },
      });
    }

    return recalculateOrder(tx, orderId);
  });
}

export async function voidLine(
  actor: PosActor,
  lineId: string,
  reason: string,
): Promise<OrderWithLines> {
  if (!reason.trim()) throw new PosError("INVALID_INPUT", "A void needs a reason.");

  return prisma.$transaction(async (tx) => {
    const line = await tx.posOrderLine.findFirst({
      where: { id: lineId, order: { restaurantId: actor.restaurantId } },
    });
    if (!line) throw new PosError("LINE_NOT_FOUND");
    await loadEditableOrder(tx, actor, line.orderId);

    await tx.posOrderLine.update({
      where: { id: lineId },
      data: {
        status: "VOID",
        voidReason: reason.trim(),
        voidedByMembershipId: actor.membershipId,
      },
    });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "LINE_VOIDED",
        entity: "PosOrderLine",
        entityId: lineId,
        meta: { reason: reason.trim(), name: line.name, quantity: line.quantity },
      },
      tx,
    );

    return recalculateOrder(tx, line.orderId);
  });
}

export async function compLine(
  actor: PosActor,
  lineId: string,
  reason: string,
): Promise<OrderWithLines> {
  return prisma.$transaction(async (tx) => {
    const line = await tx.posOrderLine.findFirst({
      where: { id: lineId, order: { restaurantId: actor.restaurantId } },
    });
    if (!line) throw new PosError("LINE_NOT_FOUND");
    await loadEditableOrder(tx, actor, line.orderId);

    await tx.posOrderLine.update({ where: { id: lineId }, data: { isComped: true } });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "LINE_COMPED",
        entity: "PosOrderLine",
        entityId: lineId,
        meta: { reason, name: line.name },
      },
      tx,
    );

    return recalculateOrder(tx, line.orderId);
  });
}

export async function setLineDiscount(
  actor: PosActor,
  lineId: string,
  discountMinor: number,
): Promise<OrderWithLines> {
  return prisma.$transaction(async (tx) => {
    const line = await tx.posOrderLine.findFirst({
      where: { id: lineId, order: { restaurantId: actor.restaurantId } },
    });
    if (!line) throw new PosError("LINE_NOT_FOUND");
    await loadEditableOrder(tx, actor, line.orderId);

    const requested = Math.max(0, roundMinor(discountMinor));
    await tx.posOrderLine.update({ where: { id: lineId }, data: { discountMinor: requested } });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "LINE_DISCOUNTED",
        entity: "PosOrderLine",
        entityId: lineId,
        meta: { discountMinor: requested },
      },
      tx,
    );

    return recalculateOrder(tx, line.orderId);
  });
}

export async function setOrderDiscount(
  actor: PosActor,
  orderId: string,
  discountMinor: number,
): Promise<OrderWithLines> {
  return prisma.$transaction(async (tx) => {
    const order = await loadEditableOrder(tx, actor, orderId);
    const requested = clampMinor(roundMinor(discountMinor), 0, Number.MAX_SAFE_INTEGER);

    await tx.posOrder.update({ where: { id: order.id }, data: { orderDiscountMinor: requested } });
    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "ORDER_DISCOUNTED",
        entity: "PosOrder",
        entityId: order.id,
        meta: { discountMinor: requested },
      },
      tx,
    );

    return recalculateOrder(tx, order.id);
  });
}

export async function moveOrderToTable(
  actor: PosActor,
  orderId: string,
  tableId: string | null,
): Promise<OrderWithLines> {
  return prisma.$transaction(async (tx) => {
    const order = await loadEditableOrder(tx, actor, orderId);

    if (tableId) {
      const table = await tx.posTable.findFirst({
        where: { id: tableId, restaurantId: actor.restaurantId, active: true },
      });
      if (!table) throw new PosError("TABLE_NOT_FOUND");

      const busy = await tx.posOrder.findFirst({
        where: { tableId, status: { in: [...EDITABLE_STATUSES] }, id: { not: orderId } },
      });
      if (busy) throw new PosError("TABLE_BUSY");
    }

    await recordAudit(
      {
        restaurantId: actor.restaurantId,
        membershipId: actor.membershipId,
        action: "ORDER_MOVED",
        entity: "PosOrder",
        entityId: order.id,
        meta: { from: order.tableId, to: tableId },
      },
      tx,
    );

    return tx.posOrder.update({
      where: { id: order.id },
      data: { tableId },
      include: orderWithLines,
    });
  });
}

/**
 * Fire the new lines to their stations. Lines already sent are left alone, so a
 * second press never reprints the whole ticket in the kitchen.
 */
export async function sendToKitchen(
  actor: PosActor,
  orderId: string,
  now = new Date(),
): Promise<OrderWithLines> {
  return prisma.$transaction(async (tx) => {
    const order = await loadEditableOrder(tx, actor, orderId);
    const pending = order.lines.filter((line) => line.status === "NEW");
    if (pending.length === 0) throw new PosError("NOTHING_TO_SEND");

    await tx.posOrderLine.updateMany({
      where: { id: { in: pending.map((l) => l.id) } },
      data: { status: "SENT", sentAt: now },
    });

    const table = order.tableId
      ? await tx.posTable.findUnique({ where: { id: order.tableId }, select: { name: true } })
      : null;
    const tableName = table?.name ?? null;

    const stations = [...new Set(pending.map((line) => line.station))];
    for (const station of stations) {
      const lines = pending.filter((line) => line.station === station);
      await tx.posPrintJob.create({
        data: {
          restaurantId: actor.restaurantId,
          kind: "KITCHEN",
          payload: {
            station,
            orderCode: order.code,
            table: tableName ?? order.channel,
            sentAt: now.toISOString(),
            lines: lines.map((line) => ({
              name: line.name,
              quantity: line.quantity,
              note: line.note,
            })),
          },
        },
      });
    }

    if (order.status === "OPEN") {
      await tx.posOrder.update({ where: { id: order.id }, data: { status: "SENT" } });
    }

    return recalculateOrder(tx, order.id);
  });
}

export async function getOrder(actor: PosActor, orderId: string): Promise<OrderWithLines> {
  const order = await prisma.posOrder.findFirst({
    where: { id: orderId, restaurantId: actor.restaurantId },
    include: orderWithLines,
  });
  if (!order) throw new PosError("ORDER_NOT_FOUND");
  return order;
}

export async function listOpenOrders(restaurantId: string): Promise<OrderWithLines[]> {
  return prisma.posOrder.findMany({
    where: { restaurantId, status: { in: [...EDITABLE_STATUSES] } },
    include: orderWithLines,
    orderBy: { openedAt: "asc" },
  });
}
