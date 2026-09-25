import { prisma } from "@/lib/prisma";

/** How many times a job is retried before the bridge stops picking it up. */
export const MAX_PRINT_ATTEMPTS = 5;

export type ClaimedJob = {
  id: string;
  kind: string;
  payload: unknown;
  attempts: number;
};

/**
 * Hand a batch of queued jobs to one bridge.
 *
 * The claim is a conditional update: a second bridge on the same till can read
 * the same ids, but only one update matches `status: QUEUED`, so a receipt is
 * never printed twice.
 */
export async function claimPrintJobs(
  restaurantId: string,
  deviceId: string,
  limit: number,
  now = new Date(),
): Promise<ClaimedJob[]> {
  const candidates = await prisma.posPrintJob.findMany({
    where: {
      restaurantId,
      status: "QUEUED",
      attempts: { lt: MAX_PRINT_ATTEMPTS },
      OR: [{ deviceId: null }, { deviceId }],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });
  if (candidates.length === 0) return [];

  const ids = candidates.map((job) => job.id);
  await prisma.posPrintJob.updateMany({
    where: { id: { in: ids }, status: "QUEUED" },
    data: { status: "PRINTING", deviceId, attempts: { increment: 1 } },
  });

  const claimed = await prisma.posPrintJob.findMany({
    where: { id: { in: ids }, status: "PRINTING", deviceId },
    select: { id: true, kind: true, payload: true, attempts: true },
  });
  void now;
  return claimed.map((job) => ({
    id: job.id,
    kind: job.kind,
    payload: job.payload,
    attempts: job.attempts,
  }));
}

export type JobResult = { id: string; ok: boolean; error?: string | null };

export async function settlePrintJobs(
  restaurantId: string,
  deviceId: string,
  results: readonly JobResult[],
  now = new Date(),
): Promise<number> {
  let settled = 0;

  for (const result of results) {
    const job = await prisma.posPrintJob.findFirst({
      where: { id: result.id, restaurantId, deviceId },
      select: { id: true, attempts: true },
    });
    if (!job) continue;

    if (result.ok) {
      await prisma.posPrintJob.update({
        where: { id: job.id },
        data: { status: "DONE", printedAt: now, lastError: null },
      });
    } else {
      // Back to the queue while retries remain: a printer that was out of paper
      // for a minute should not lose the ticket.
      const exhausted = job.attempts >= MAX_PRINT_ATTEMPTS;
      await prisma.posPrintJob.update({
        where: { id: job.id },
        data: {
          status: exhausted ? "FAILED" : "QUEUED",
          lastError: result.error?.slice(0, 500) ?? "Unknown printer error",
          ...(exhausted ? {} : { deviceId: null }),
        },
      });
    }
    settled++;
  }

  return settled;
}
