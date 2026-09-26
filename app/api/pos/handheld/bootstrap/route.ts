import { NextResponse } from "next/server";
import { authenticateHandheld } from "@/lib/pos/handheld-auth";
import { handheldError, handheldHandler } from "@/lib/pos/handheld-http";
import { getFloorPlan, getTerminalMenu } from "@/lib/pos/terminal-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Everything the handheld needs to draw its two screens, in one round trip.
 *
 * A waiter opens the app at a table with a customer waiting; three sequential
 * requests over a patchy café network is three chances to be left staring at a
 * spinner.
 */
export async function GET(request: Request) {
  return handheldHandler(async () => {
    const actor = await authenticateHandheld(request);
    if (!actor) return handheldError("UNAUTHORIZED");

    const [areas, menu] = await Promise.all([
      getFloorPlan(actor.restaurantId),
      getTerminalMenu(actor.restaurantId),
    ]);

    return NextResponse.json({
      staff: { membershipId: actor.membershipId, name: actor.staffName, role: actor.role },
      venue: { id: actor.restaurantId, name: actor.venueName, currency: actor.currency },
      device: { id: actor.deviceId, name: actor.deviceName },
      areas: areas.map((area) => ({
        id: area.id,
        name: area.name,
        tables: area.tables.map((table) => ({
          id: table.id,
          name: table.name,
          seats: table.seats,
          order: table.order
            ? {
                id: table.order.id,
                code: table.order.code,
                totalMinor: table.order.totalMinor,
                openedAt: table.order.openedAt.toISOString(),
              }
            : null,
        })),
      })),
      categories: menu.map((category) => ({
        id: category.id,
        name: category.name,
        products: category.products.map((product) => ({
          id: product.id,
          name: product.name,
          priceMinor: product.priceMinor,
          isMapped: product.isMapped,
          modifierGroups: product.modifierGroups,
        })),
      })),
    });
  });
}
