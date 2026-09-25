import type { Prisma } from "@prisma/client";
import { toMajor } from "./money";
import type { OrderWithLines } from "./order-service";

export const POS_PROVIDER = "costera-pos";

/**
 * Project a paid ticket into the Sale rows the cost engine reads.
 *
 * This is the single boundary where POS money (Int minor units) becomes engine
 * money (Float), and the single place that marks a workspace as POS-fed. Lines
 * without a menuItemExtId are skipped on purpose: an unmapped product has no
 * recipe, so counting it would understate food cost rather than leave a visible
 * gap on the mapping panel.
 *
 * Re-running it for the same order is safe - previous rows are cleared first,
 * so a repaired or reopened ticket cannot double-count.
 */
export async function projectOrderToSales(
  tx: Prisma.TransactionClient,
  order: OrderWithLines,
  now = new Date(),
): Promise<{ projected: number; skipped: number }> {
  await tx.sale.deleteMany({ where: { posOrderId: order.id } });

  const chargeable = order.lines.filter((line) => line.status !== "VOID" && line.quantity > 0);
  const mapped = chargeable.filter((line) => line.menuItemExtId);

  if (mapped.length > 0) {
    await tx.sale.createMany({
      data: mapped.map((line) => ({
        restaurantId: order.restaurantId,
        menuItemExtId: line.menuItemExtId as string,
        quantity: line.quantity,
        channel: order.channel,
        locationId: "main",
        netSales: toMajor(line.lineTotalMinor),
        occurredAt: order.closedAt ?? now,
        posOrderId: order.id,
      })),
    });
  }

  await markWorkspaceAsPosFed(tx, order.restaurantId, order.businessDay, now);

  return { projected: mapped.length, skipped: chargeable.length - mapped.length };
}

/**
 * Point the workspace at the POS as its data source and widen the analysed
 * period to cover this ticket. Once a venue starts ringing sales through
 * COSTERA, the dashboards must read the POS and not a stale file import.
 */
async function markWorkspaceAsPosFed(
  tx: Prisma.TransactionClient,
  restaurantId: string,
  businessDay: Date,
  now: Date,
): Promise<void> {
  const existing = await tx.dataSource.findUnique({ where: { restaurantId } });

  if (!existing) {
    await tx.dataSource.create({
      data: {
        restaurantId,
        kind: "POS_API",
        provider: POS_PROVIDER,
        periodFrom: businessDay,
        periodTo: businessDay,
        syncedAt: now,
      },
    });
    return;
  }

  await tx.dataSource.update({
    where: { restaurantId },
    data: {
      kind: "POS_API",
      provider: POS_PROVIDER,
      periodFrom: businessDay < existing.periodFrom ? businessDay : existing.periodFrom,
      periodTo: businessDay > existing.periodTo ? businessDay : existing.periodTo,
      syncedAt: now,
    },
  });
}
