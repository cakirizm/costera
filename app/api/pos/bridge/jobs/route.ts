import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateDevice, touchDevice } from "@/lib/pos/bridge-auth";
import { claimPrintJobs, settlePrintJobs } from "@/lib/pos/print-queue";

export const runtime = "nodejs";

const UNAUTHORIZED = NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

const claimSchema = z.object({ limit: z.coerce.number().int().min(1).max(20).default(5) });

const settleSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        ok: z.boolean(),
        error: z.string().max(500).nullish(),
      }),
    )
    .min(1)
    .max(20),
});

/** The bridge claims work. Long-polling is deliberately not used: a till that
 *  loses its network must fall back to a plain retry, not a held connection. */
export async function POST(request: Request) {
  const device = await authenticateDevice(request);
  if (!device) return UNAUTHORIZED;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
  }

  const jobs = await claimPrintJobs(device.restaurantId, device.deviceId, parsed.data.limit);
  await touchDevice(device.deviceId);

  return NextResponse.json({ ok: true, device: device.name, jobs });
}

/** Results come back on the same route so the bridge needs one endpoint. */
export async function PUT(request: Request) {
  const device = await authenticateDevice(request);
  if (!device) return UNAUTHORIZED;

  const parsed = settleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
  }

  const settled = await settlePrintJobs(device.restaurantId, device.deviceId, parsed.data.results);
  return NextResponse.json({ ok: true, settled });
}
