import { NextResponse } from "next/server";
import { authenticateHandheld } from "@/lib/pos/handheld-auth";
import { handheldError, handheldHandler } from "@/lib/pos/handheld-http";
import { toHandheldOrder } from "@/lib/pos/handheld-view";
import { addLines } from "@/lib/pos/order-service";
import { addLinesSchema } from "@/shared/handheld-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Add lines to a ticket.
 *
 * clientLineId is required here, unlike on the till: a phone on a café network
 * will lose a request sooner or later, and the waiter will press again.
 */
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  return handheldHandler(async () => {
    const actor = await authenticateHandheld(request);
    if (!actor) return handheldError("UNAUTHORIZED");

    const parsed = addLinesSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return handheldError("INVALID_REQUEST");

    const { orderId } = await params;
    const order = await addLines(
      { restaurantId: actor.restaurantId, membershipId: actor.membershipId },
      orderId,
      parsed.data.items,
    );
    return NextResponse.json(await toHandheldOrder(order));
  });
}
