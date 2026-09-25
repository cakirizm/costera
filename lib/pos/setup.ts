import { prisma } from "@/lib/prisma";
import { toMinor } from "./money";

/**
 * First-run setup for the terminal: a floor plan, tax groups and a menu.
 *
 * When the workspace already holds MenuItems (from the demo dataset or a file
 * import), the POS products are built from those and carry their extId. That is
 * what makes a ticket rung here show up in the variance report straight away,
 * instead of landing as an unmapped product.
 */

const FALLBACK_MENU: { category: string; station: string; items: [string, number][] }[] = [
  {
    category: "Ana Yemek",
    station: "KITCHEN",
    items: [
      ["Izgara Köfte", 285],
      ["Tavuk Şiş", 265],
      ["Adana Kebap", 315],
      ["Karışık Izgara", 420],
    ],
  },
  {
    category: "Başlangıç",
    station: "KITCHEN",
    items: [
      ["Mercimek Çorbası", 95],
      ["Humus", 125],
      ["Sigara Böreği", 135],
    ],
  },
  {
    category: "İçecek",
    station: "BAR",
    items: [
      ["Ayran", 45],
      ["Türk Kahvesi", 75],
      ["Taze Sıkım Portakal", 95],
    ],
  },
];

export type SetupResult = { areas: number; tables: number; categories: number; products: number };

export async function setupTerminalWorkspace(restaurantId: string): Promise<SetupResult> {
  const existing = await prisma.posProduct.count({ where: { restaurantId } });
  if (existing > 0) {
    return { areas: 0, tables: 0, categories: 0, products: 0 };
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId },
    orderBy: { name: "asc" },
  });

  return prisma.$transaction(async (tx) => {
    const foodTax = await tx.posTaxGroup.create({
      data: { restaurantId, name: "Yeme-İçme", ratePct: 10, okcDepartment: 1 },
    });
    const drinkTax = await tx.posTaxGroup.create({
      data: { restaurantId, name: "Alkollü İçecek", ratePct: 20, okcDepartment: 2 },
    });

    const salon = await tx.posArea.create({
      data: { restaurantId, name: "Salon", sortOrder: 0 },
    });
    const teras = await tx.posArea.create({
      data: { restaurantId, name: "Teras", sortOrder: 1 },
    });

    let tables = 0;
    for (let i = 1; i <= 8; i++) {
      await tx.posTable.create({
        data: {
          restaurantId,
          areaId: salon.id,
          name: `S${i}`,
          seats: i > 6 ? 6 : 4,
          posX: (i - 1) % 4,
          posY: Math.floor((i - 1) / 4),
        },
      });
      tables++;
    }
    for (let i = 1; i <= 4; i++) {
      await tx.posTable.create({
        data: {
          restaurantId,
          areaId: teras.id,
          name: `T${i}`,
          seats: 4,
          posX: (i - 1) % 4,
          posY: 0,
        },
      });
      tables++;
    }

    let categories = 0;
    let products = 0;

    if (menuItems.length > 0) {
      // The workspace already has a menu the cost engine knows about. Mirror it
      // so every button on the terminal maps to a recipe.
      const category = await tx.posCategory.create({
        data: { restaurantId, name: "Menü", station: "KITCHEN", sortOrder: 0 },
      });
      categories++;
      for (const [index, item] of menuItems.entries()) {
        await tx.posProduct.create({
          data: {
            restaurantId,
            categoryId: category.id,
            taxGroupId: foodTax.id,
            menuItemExtId: item.extId,
            name: item.name,
            priceMinor: toMinor(item.sellingPrice),
            sortOrder: index,
          },
        });
        products++;
      }
    } else {
      for (const [index, group] of FALLBACK_MENU.entries()) {
        const category = await tx.posCategory.create({
          data: { restaurantId, name: group.category, station: group.station, sortOrder: index },
        });
        categories++;
        for (const [itemIndex, [name, price]] of group.items.entries()) {
          await tx.posProduct.create({
            data: {
              restaurantId,
              categoryId: category.id,
              taxGroupId: group.station === "BAR" ? drinkTax.id : foodTax.id,
              name,
              priceMinor: toMinor(price),
              sortOrder: itemIndex,
            },
          });
          products++;
        }
      }
    }

    return { areas: 2, tables, categories, products };
  });
}
