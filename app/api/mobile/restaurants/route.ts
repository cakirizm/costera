import { authenticateMobile } from "@/lib/mobile/auth";
import { mobileHandler, mobileJson } from "@/lib/mobile/http";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export async function GET(request: Request) {
  return mobileHandler(async () => {
    const session = await authenticateMobile(request);
    if (!session) return mobileJson({ error: "UNAUTHORIZED" }, 401);
    const memberships = await prisma.membership.findMany({
      where: { userId: session.userId }, orderBy: { createdAt: "asc" },
      include: { restaurant: { select: {
        id: true, name: true, city: true,
        sales: { distinct: ["locationId"], select: { locationId: true }, orderBy: { locationId: "asc" } },
      } } },
    });
    return mobileJson({ restaurants: memberships.map(({ restaurant, role }) => ({
      id: restaurant.id, name: restaurant.name, city: restaurant.city, role,
      locations: restaurant.sales.map((sale) => ({ id: sale.locationId, name: sale.locationId })),
    })) });
  });
}
