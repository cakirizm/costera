import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Append-only trail for the actions an owner asks about when the drawer does
 * not balance: voids, comps, discounts, manual price overrides, drawer opens.
 * Never updated or deleted, and never written outside the transaction that
 * performed the action it describes.
 */
export type AuditEntry = {
  restaurantId: string;
  membershipId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Prisma.InputJsonValue;
};

export async function recordAudit(
  entry: AuditEntry,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<void> {
  await tx.posAuditLog.create({
    data: {
      restaurantId: entry.restaurantId,
      membershipId: entry.membershipId ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      meta: entry.meta,
    },
  });
}
