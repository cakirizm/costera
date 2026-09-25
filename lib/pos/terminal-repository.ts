import { prisma } from "@/lib/prisma";

/**
 * Read models for the terminal screens. Kept apart from order-service, which
 * only mutates: the floor plan is read on every touch and must stay a small
 * number of queries.
 */

export type TerminalModifier = { id: string; name: string; priceMinor: number };

export type TerminalProduct = {
  id: string;
  name: string;
  priceMinor: number;
  color: string | null;
  isMapped: boolean;
  modifierGroups: {
    id: string;
    name: string;
    required: boolean;
    maxSelect: number;
    modifiers: TerminalModifier[];
  }[];
};

export type TerminalCategory = {
  id: string;
  name: string;
  color: string | null;
  station: string;
  products: TerminalProduct[];
};

export async function getTerminalMenu(restaurantId: string): Promise<TerminalCategory[]> {
  const categories = await prisma.posCategory.findMany({
    where: { restaurantId, active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      products: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          modifierLinks: {
            orderBy: { sortOrder: "asc" },
            include: {
              group: { include: { modifiers: { where: { active: true }, orderBy: { sortOrder: "asc" } } } },
            },
          },
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
    station: category.station,
    products: category.products.map((product) => ({
      id: product.id,
      name: product.name,
      priceMinor: product.priceMinor,
      color: product.color,
      // An unmapped product still sells; it just cannot reach the cost engine,
      // so the terminal flags it rather than hiding it.
      isMapped: Boolean(product.menuItemExtId),
      modifierGroups: product.modifierLinks.map((link) => ({
        id: link.group.id,
        name: link.group.name,
        required: link.group.required,
        maxSelect: link.group.maxSelect,
        modifiers: link.group.modifiers.map((m) => ({
          id: m.id,
          name: m.name,
          priceMinor: m.priceMinor,
        })),
      })),
    })),
  }));
}

export type TerminalTable = {
  id: string;
  name: string;
  seats: number;
  order: { id: string; code: number; totalMinor: number; openedAt: Date; guestCount: number } | null;
};

export type TerminalArea = { id: string; name: string; tables: TerminalTable[] };

export async function getFloorPlan(restaurantId: string): Promise<TerminalArea[]> {
  const [areas, openOrders] = await Promise.all([
    prisma.posArea.findMany({
      where: { restaurantId, active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        tables: { where: { active: true }, orderBy: [{ posY: "asc" }, { posX: "asc" }, { name: "asc" }] },
      },
    }),
    prisma.posOrder.findMany({
      where: { restaurantId, status: { in: ["OPEN", "SENT", "PARTIALLY_PAID"] }, tableId: { not: null } },
      select: { id: true, code: true, totalMinor: true, openedAt: true, guestCount: true, tableId: true },
      orderBy: { openedAt: "asc" },
    }),
  ]);

  const byTable = new Map(openOrders.map((order) => [order.tableId as string, order]));

  return areas.map((area) => ({
    id: area.id,
    name: area.name,
    tables: area.tables.map((table) => ({
      id: table.id,
      name: table.name,
      seats: table.seats,
      order: byTable.get(table.id) ?? null,
    })),
  }));
}

/** Tickets with no table: takeaway, delivery, counter. */
export async function getCounterOrders(restaurantId: string) {
  return prisma.posOrder.findMany({
    where: { restaurantId, status: { in: ["OPEN", "SENT", "PARTIALLY_PAID"] }, tableId: null },
    select: { id: true, code: true, totalMinor: true, openedAt: true, channel: true },
    orderBy: { openedAt: "asc" },
  });
}

export async function hasTerminalSetup(restaurantId: string): Promise<boolean> {
  const products = await prisma.posProduct.count({ where: { restaurantId, active: true } });
  return products > 0;
}
