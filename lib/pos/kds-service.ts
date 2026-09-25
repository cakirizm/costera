import type { PosLineStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PosError } from "./errors";
import type { PosActor } from "./order-service";

/**
 * Kitchen display state machine.
 *
 * Only forward moves are allowed. A cook who taps twice must not send a line
 * back to the queue, and a line can never jump from the queue straight to
 * served without someone having cooked it.
 */
const ORDER_OF_STATUS: PosLineStatus[] = ["NEW", "SENT", "PREPARING", "READY", "SERVED"];

function rank(status: PosLineStatus): number {
  return ORDER_OF_STATUS.indexOf(status);
}

const TIMESTAMP_FOR: Partial<Record<PosLineStatus, "readyAt" | "servedAt">> = {
  READY: "readyAt",
  SERVED: "servedAt",
};

export async function advanceLines(
  actor: PosActor,
  lineIds: readonly string[],
  to: PosLineStatus,
  now = new Date(),
): Promise<number> {
  if (lineIds.length === 0) throw new PosError("INVALID_INPUT", "No lines given.");
  if (to === "NEW" || to === "SENT") throw new PosError("INVALID_INPUT", "Not a kitchen status.");

  const lines = await prisma.posOrderLine.findMany({
    where: { id: { in: [...lineIds] }, order: { restaurantId: actor.restaurantId } },
    select: { id: true, status: true },
  });
  if (lines.length === 0) throw new PosError("LINE_NOT_FOUND");

  // Silently skip lines that are already at or past the target: a second tap on
  // a slow screen is a no-op, not an error the cook has to read.
  const movable = lines.filter((line) => rank(line.status) < rank(to)).map((line) => line.id);
  if (movable.length === 0) return 0;

  const timestampField = TIMESTAMP_FOR[to];
  const result = await prisma.posOrderLine.updateMany({
    where: { id: { in: movable } },
    data: { status: to, ...(timestampField ? { [timestampField]: now } : {}) },
  });

  return result.count;
}
