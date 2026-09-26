import { NextResponse } from "next/server";
import { authenticateHandheld } from "@/lib/pos/handheld-auth";
import { handheldError, handheldHandler } from "@/lib/pos/handheld-http";
import { toHandheldOrder } from "@/lib/pos/handheld-view";
import { sendToKitchen } from "@/lib/pos/order-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Fire the new lines to the kitchen, exactly as the till does. */
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  return handheldHandler(async () => {
    const actor = await authenticateHandheld(request);
    if (!actor) return handheldError("UNAUTHORIZED");

    const { orderId } = await params;
    const order = await sendToKitchen(
      { restaurantId: actor.restaurantId, membershipId: actor.membershipId },
      orderId,
    );
    return NextResponse.json(await toHandheldOrder(order));
  });
}
