import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/pos/audit";
import { authenticateHandheld, signInHandheld, signOutHandheld } from "@/lib/pos/handheld-auth";
import { handheldError, handheldHandler } from "@/lib/pos/handheld-http";
import { enrolSchema, handheldSignInSchema } from "@/shared/handheld-contract";

export const runtime = "nodejs";

const bodySchema = enrolSchema.merge(handheldSignInSchema);

/** Exchange the enrolled device token plus a staff PIN for a session. */
export async function POST(request: Request) {
  return handheldHandler(async () => {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return handheldError("INVALID_REQUEST");

    const result = await signInHandheld(parsed.data.deviceToken, parsed.data.pin);
    if (!result.ok) return handheldError(result.error);

    const { actor } = result;
    await recordAudit({
      restaurantId: actor.restaurantId,
      membershipId: actor.membershipId,
      action: "HANDHELD_SIGNED_IN",
      entity: "PosDevice",
      entityId: actor.deviceId,
      meta: { device: actor.deviceName },
    });

    return NextResponse.json({
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
      staff: { membershipId: actor.membershipId, name: actor.staffName, role: actor.role },
      venue: { id: actor.restaurantId, name: actor.venueName, currency: actor.currency },
      device: { id: actor.deviceId, name: actor.deviceName },
    });
  });
}

/** Hand the phone back: ends this session only, the device stays enrolled. */
export async function DELETE(request: Request) {
  return handheldHandler(async () => {
    const actor = await authenticateHandheld(request);
    if (!actor) return handheldError("UNAUTHORIZED");
    await signOutHandheld(actor.sessionId);
    return NextResponse.json({ ok: true });
  });
}

export const dynamic = "force-dynamic";
