import type {
  CosteraAnalysis,
  CosteraInput,
  IngredientVariance,
  RootCauseHint,
} from "./types";

const round = (value: number, decimals = 2) => {
  const p = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * p) / p;
};

const riskFromValue = (value: number, pct: number | null): IngredientVariance["risk"] => {
  if (value >= 150 || (pct !== null && pct >= 10)) return "High";
  if (value >= 40 || (pct !== null && pct >= 5)) return "Medium";
  return "Low";
};

const rootCauseHint = (args: {
  theoretical: number;
  actualUsage: number;
  knownWaste: number;
  unexplained: number;
  variancePct: number | null;
}): RootCauseHint => {
  const { theoretical, actualUsage, knownWaste, unexplained, variancePct } = args;
  const absPct = variancePct === null ? null : Math.abs(variancePct);

  if (theoretical === 0 && actualUsage > 0) {
    return {
      label: "Missing recipe / mapping",
      confidence: "High",
      reason: "Inventory usage exists but COSTERA has no theoretical recipe consumption for this ingredient.",
      action: "Check recipe mapping and confirm that every sold menu item using this ingredient is linked.",
    };
  }

  if (unexplained < 0) {
    return {
      label: "Count timing / transfer mismatch",
      confidence: absPct !== null && absPct >= 10 ? "Medium" : "Low",
      reason: "Recorded stock usage is lower than recipe-driven theoretical usage.",
      action: "Review stock count timing, transfers, purchase receipts and recipe quantity assumptions.",
    };
  }

  if (unexplained > 0 && knownWaste === 0 && absPct !== null && absPct >= 15) {
    return {
      label: "Portioning, unrecorded waste or stock-count issue",
      confidence: "Medium",
      reason: "Actual usage materially exceeds theoretical usage and no approved waste explains the difference.",
      action: "Perform a physical count, review portioning standards and check whether waste was recorded.",
    };
  }

  if (unexplained > 0 && knownWaste > 0 && absPct !== null && absPct >= 10) {
    return {
      label: "Excess usage beyond approved waste",
      confidence: "Medium",
      reason: "Approved waste exists, but a material unexplained balance still remains after removing it.",
      action: "Review receiving, transfers, portion sizes and kitchen handling for this ingredient.",
    };
  }

  if (unexplained > 0) {
    return {
      label: "Small unexplained usage",
      confidence: "Low",
      reason: "Actual usage is above theoretical usage, but the variance is not large enough to isolate a cause from aggregate data alone.",
      action: "Monitor the next count cycle and compare by shift, branch and menu item when detailed feeds are available.",
    };
  }

  return {
    label: "Within expected range",
    confidence: "High",
    reason: "Actual usage is aligned with theoretical usage after approved waste.",
    action: "No immediate action required.",
  };
};

export function analyzeCost(input: CosteraInput): CosteraAnalysis {
  const ingredients = new Map(input.ingredients.map((x) => [x.id, x]));
  const menuItems = new Map(input.menuItems.map((x) => [x.id, x]));

  const theoreticalQty = new Map<string, number>();
  const missingMenuItems = new Set<string>();
  const missingIngredients = new Set<string>();

  let netSales = 0;
  let mappedSalesCount = 0;

  for (const sale of input.sales) {
    const item = menuItems.get(sale.menuItemId);
    if (!item) {
      missingMenuItems.add(sale.menuItemId);
      continue;
    }

    mappedSalesCount += 1;
    netSales += sale.netSales ?? sale.quantity * item.sellingPrice;

    for (const line of item.recipe) {
      if (!ingredients.has(line.ingredientId)) {
        missingIngredients.add(line.ingredientId);
        continue;
      }

      theoreticalQty.set(
        line.ingredientId,
        (theoreticalQty.get(line.ingredientId) ?? 0) + sale.quantity * line.quantity,
      );
    }
  }

  const inventory = new Map(input.inventory.map((x) => [x.ingredientId, x]));
  const ingredientVariance: IngredientVariance[] = [];

  let theoreticalCost = 0;
  let actualCost = 0;
  let knownWasteCost = 0;
  let unexplainedCost = 0;

  for (const ingredient of input.ingredients) {
    const inv = inventory.get(ingredient.id);
    const theoretical = theoreticalQty.get(ingredient.id) ?? 0;

    const actualUsage = inv
      ? inv.openingQty +
        inv.purchasesQty +
        (inv.transferInQty ?? 0) -
        (inv.transferOutQty ?? 0) -
        inv.closingQty
      : theoretical;

    const knownWaste = inv?.knownWasteQty ?? 0;
    const unexplained = actualUsage - theoretical - knownWaste;

    const theoreticalValue = theoretical * ingredient.unitCost;
    const actualValue = actualUsage * ingredient.unitCost;
    const knownWasteValue = knownWaste * ingredient.unitCost;
    const unexplainedValue = unexplained * ingredient.unitCost;

    const variancePct =
      theoretical > 0 ? (unexplained / theoretical) * 100 : unexplained !== 0 ? 100 : null;

    theoreticalCost += theoreticalValue;
    actualCost += actualValue;
    knownWasteCost += knownWasteValue;
    unexplainedCost += unexplainedValue;

    ingredientVariance.push({
      ingredientId: ingredient.id,
      ingredient: ingredient.name,
      unit: ingredient.unit,
      theoreticalQty: round(theoretical, 3),
      actualUsageQty: round(actualUsage, 3),
      knownWasteQty: round(knownWaste, 3),
      unexplainedQty: round(unexplained, 3),
      unitCost: round(ingredient.unitCost, 4),
      unexplainedValue: round(unexplainedValue),
      theoreticalValue: round(theoreticalValue),
      actualValue: round(actualValue),
      variancePct: variancePct === null ? null : round(variancePct, 1),
      risk: riskFromValue(Math.abs(unexplainedValue), variancePct === null ? null : Math.abs(variancePct)),
      shareOfGapPct: 0,
      rootCause: rootCauseHint({
        theoretical,
        actualUsage,
        knownWaste,
        unexplained,
        variancePct,
      }),
    });
  }

  ingredientVariance.sort(
    (a, b) => Math.abs(b.unexplainedValue) - Math.abs(a.unexplainedValue),
  );

  const absoluteGap = ingredientVariance.reduce(
    (sum, item) => sum + Math.max(0, item.unexplainedValue),
    0,
  );

  for (const item of ingredientVariance) {
    item.shareOfGapPct =
      absoluteGap > 0 ? round((Math.max(0, item.unexplainedValue) / absoluteGap) * 100, 1) : 0;
  }

  const theoreticalFoodCostPct = netSales > 0 ? (theoreticalCost / netSales) * 100 : 0;
  const actualFoodCostPct = netSales > 0 ? (actualCost / netSales) * 100 : 0;

  return {
    period: input.period,
    locationId: input.locationId,
    totals: {
      netSales: round(netSales),
      theoreticalCost: round(theoreticalCost),
      actualCost: round(actualCost),
      knownWasteCost: round(knownWasteCost),
      unexplainedCost: round(unexplainedCost),
      theoreticalFoodCostPct: round(theoreticalFoodCostPct, 1),
      actualFoodCostPct: round(actualFoodCostPct, 1),
      targetFoodCostPct: round(input.targetFoodCostPct, 1),
      targetGapPp: round(actualFoodCostPct - input.targetFoodCostPct, 1),
    },
    ingredientVariance,
    dataQuality: {
      missingMenuItems: [...missingMenuItems],
      missingIngredients: [...missingIngredients],
      salesCount: input.sales.length,
      mappedSalesCount,
    },
  };
}
