import { NextResponse } from "next/server";
import { authenticateHandheld } from "@/lib/pos/handheld-auth";
import { handheldError, handheldHandler } from "@/lib/pos/handheld-http";
import { toHandheldOrder } from "@/lib/pos/handheld-view";
import { listOpenOrders, openOrder } from "@/lib/pos/order-service";
import { currentShift } from "@/lib/pos/shift-service";
import { openOrderSchema } from "@/shared/handheld-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Open tickets, so a waiter can pick up a table someone else started. */
export async function GET(request: Request) {
  return handheldHandler(async () => {
    const actor = await authenticateHandheld(request);
    if (!actor) return handheldError("UNAUTHORIZED");

    const orders = await listOpenOrders(actor.restaurantId);
    return NextResponse.json({
      orders: await Promise.all(orders.map(toHandheldOrder)),
    });
  });
}

export async function POST(request: Request) {
  return handheldHandler(async () => {
    const actor = await authenticateHandheld(request);
    if (!actor) return handheldError("UNAUTHORIZED");

    const parsed = openOrderSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return handheldError("INVALID_REQUEST");

    // Which shift the ticket belongs to is the server's call, exactly as it is
    // on the till: a phone must not be able to name a drawer.
    const shift = await currentShift(actor.restaurantId);
    const order = await openOrder(
      { restaurantId: actor.restaurantId, membershipId: actor.membershipId },
      {
        clientOrderId: parsed.data.clientOrderId,
        tableId: parsed.data.tableId,
        channel: parsed.data.tableId ? "Dine-in" : "Takeaway",
        shiftId: shift?.id ?? null,
      },
    );

    return NextResponse.json(await toHandheldOrder(order));
  });
}
