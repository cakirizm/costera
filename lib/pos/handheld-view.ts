import { prisma } from "@/lib/prisma";
import type { OrderWithLines } from "./order-service";

/**
 * The order as the handheld shows it: the table's name rather than its id, and
 * no money the waiter cannot act on. Payment stays at the till, so the phone
 * never renders a due amount it could not take.
 */
export async function toHandheldOrder(order: OrderWithLines) {
  const table = order.tableId
    ? await prisma.posTable.findUnique({ where: { id: order.tableId }, select: { name: true } })
    : null;

  return {
    id: order.id,
    code: order.code,
    status: order.status,
    tableName: table?.name ?? null,
    subtotalMinor: order.subtotalMinor,
    discountMinor: order.discountMinor,
    taxMinor: order.taxMinor,
    totalMinor: order.totalMinor,
    lines: order.lines.map((line) => ({
      id: line.id,
      name: line.name,
      quantity: line.quantity,
      lineTotalMinor: line.lineTotalMinor,
      status: line.status,
      note: line.note,
      modifiers: line.modifiers.map((m) => m.name),
    })),
  };
}
