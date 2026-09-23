import { z } from "zod";
import { authenticateMobile } from "@/lib/mobile/auth";
import { mobileHandler, mobileJson } from "@/lib/mobile/http";
import { buildMobileOverview } from "@/lib/mobile/overview";
import { getRestaurantInput, getDataSource, getExpenses } from "@/lib/costera/repository";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
const querySchema = z.object({ restaurantId: z.string().min(1).max(128), locationId: z.string().min(1).max(200).nullable() });
export async function GET(request: Request) {
  return mobileHandler(async () => {
    const session = await authenticateMobile(request);
    if (!session) return mobileJson({ error: "UNAUTHORIZED" }, 401);
    const params = new URL(request.url).searchParams;
    const query = querySchema.safeParse({ restaurantId: params.get("restaurantId"), locationId: params.get("locationId") });
    if (!query.success) return mobileJson({ error: "INVALID_REQUEST" }, 400);
    const { restaurantId, locationId } = query.data;
    const membership = await prisma.membership.findUnique({ where: { userId_restaurantId: { userId: session.userId, restaurantId } } });
    if (!membership) return mobileJson({ error: "FORBIDDEN" }, 403);
    const [input, source, expenses] = await Promise.all([getRestaurantInput(restaurantId), getDataSource(restaurantId), getExpenses(restaurantId)]);
    if (locationId !== null && !input?.sales.some(s => s.locationId === locationId)) return mobileJson({ error: "LOCATION_NOT_FOUND" }, 404);
    return mobileJson(buildMobileOverview({ restaurantId, locationId, input, source, expenses }));
  });
}
