import { prisma } from "@/lib/prisma";
import type { CosteraInput, Unit } from "@/lib/costera/types";

export type DataSourceMeta = {
  kind: "DEMO" | "IMPORT" | "POS_API";
  provider: string;
  syncedAt: Date;
};

function toUnit(value: string): Unit {
  return value === "L" || value === "pcs" ? value : "kg";
}

export async function getDataSource(restaurantId: string) {
  return prisma.dataSource.findUnique({ where: { restaurantId } });
}

export async function getRestaurantInput(restaurantId: string): Promise<CosteraInput | null> {
  const source = await prisma.dataSource.findUnique({ where: { restaurantId } });
  if (!source) return null;

  const [restaurant, ingredients, menuItems, sales, inventory] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId } }),
    prisma.ingredient.findMany({ where: { restaurantId } }),
    prisma.menuItem.findMany({ where: { restaurantId }, include: { recipeLines: true } }),
    prisma.sale.findMany({ where: { restaurantId } }),
    prisma.inventoryRow.findMany({ where: { restaurantId } }),
  ]);

  return {
    period: {
      from: source.periodFrom.toISOString().slice(0, 10),
      to: source.periodTo.toISOString().slice(0, 10),
    },
    locationId: "all",
    targetFoodCostPct: restaurant?.targetFoodCostPct ?? 25,
    ingredients: ingredients.map((i) => ({
      id: i.extId,
      name: i.name,
      unit: toUnit(i.unit),
      unitCost: i.unitCost,
    })),
    menuItems: menuItems.map((m) => ({
      id: m.extId,
      name: m.name,
      sellingPrice: m.sellingPrice,
      recipe: m.recipeLines.map((r) => ({ ingredientId: r.ingredientExtId, quantity: r.quantity })),
    })),
    sales: sales.map((s) => ({
      id: s.id,
      menuItemId: s.menuItemExtId,
      quantity: s.quantity,
      channel: s.channel,
      locationId: s.locationId,
      netSales: s.netSales ?? undefined,
    })),
    inventory: inventory.map((v) => ({
      ingredientId: v.ingredientExtId,
      openingQty: v.openingQty,
      purchasesQty: v.purchasesQty,
      transferInQty: v.transferInQty,
      transferOutQty: v.transferOutQty,
      closingQty: v.closingQty,
      knownWasteQty: v.knownWasteQty,
    })),
  };
}

// Replace the restaurant's entire dataset in one transaction ("connect / import" = fresh data).
export async function saveDataset(restaurantId: string, input: CosteraInput, meta: DataSourceMeta) {
  await prisma.$transaction(async (tx) => {
    await tx.sale.deleteMany({ where: { restaurantId } });
    await tx.inventoryRow.deleteMany({ where: { restaurantId } });
    await tx.menuItem.deleteMany({ where: { restaurantId } });
    await tx.ingredient.deleteMany({ where: { restaurantId } });

    await tx.restaurant.update({
      where: { id: restaurantId },
      data: { targetFoodCostPct: input.targetFoodCostPct },
    });

    for (const ing of input.ingredients) {
      await tx.ingredient.create({
        data: { restaurantId, extId: ing.id, name: ing.name, unit: ing.unit, unitCost: ing.unitCost },
      });
    }

    for (const item of input.menuItems) {
      await tx.menuItem.create({
        data: {
          restaurantId,
          extId: item.id,
          name: item.name,
          sellingPrice: item.sellingPrice,
          recipeLines: {
            create: item.recipe.map((r) => ({ ingredientExtId: r.ingredientId, quantity: r.quantity })),
          },
        },
      });
    }

    if (input.sales.length) {
      await tx.sale.createMany({
        data: input.sales.map((s) => ({
          restaurantId,
          menuItemExtId: s.menuItemId,
          quantity: s.quantity,
          channel: s.channel,
          locationId: s.locationId,
          netSales: s.netSales ?? null,
        })),
      });
    }

    for (const inv of input.inventory) {
      await tx.inventoryRow.create({
        data: {
          restaurantId,
          ingredientExtId: inv.ingredientId,
          openingQty: inv.openingQty,
          purchasesQty: inv.purchasesQty,
          transferInQty: inv.transferInQty ?? 0,
          transferOutQty: inv.transferOutQty ?? 0,
          closingQty: inv.closingQty,
          knownWasteQty: inv.knownWasteQty ?? 0,
        },
      });
    }

    await tx.dataSource.upsert({
      where: { restaurantId },
      create: {
        restaurantId,
        kind: meta.kind,
        provider: meta.provider,
        periodFrom: new Date(input.period.from),
        periodTo: new Date(input.period.to),
        syncedAt: meta.syncedAt,
      },
      update: {
        kind: meta.kind,
        provider: meta.provider,
        periodFrom: new Date(input.period.from),
        periodTo: new Date(input.period.to),
        syncedAt: meta.syncedAt,
      },
    });
  });
}

// Disconnect: remove the dataset so dashboards return to the empty state.
export async function clearDataset(restaurantId: string) {
  await prisma.$transaction([
    prisma.sale.deleteMany({ where: { restaurantId } }),
    prisma.inventoryRow.deleteMany({ where: { restaurantId } }),
    prisma.menuItem.deleteMany({ where: { restaurantId } }),
    prisma.ingredient.deleteMany({ where: { restaurantId } }),
    prisma.dataSource.deleteMany({ where: { restaurantId } }),
  ]);
}
