export type Unit = "kg" | "L" | "pcs";

export type Ingredient = {
  id: string;
  name: string;
  unit: Unit;
  unitCost: number;
};

export type RecipeLine = {
  ingredientId: string;
  quantity: number;
};

export type MenuItem = {
  id: string;
  name: string;
  sellingPrice: number;
  recipe: RecipeLine[];
};

export type Sale = {
  id: string;
  menuItemId: string;
  quantity: number;
  channel: string;
  locationId: string;
  netSales?: number;
};

export type InventoryPosition = {
  ingredientId: string;
  openingQty: number;
  purchasesQty: number;
  transferInQty?: number;
  transferOutQty?: number;
  closingQty: number;
  knownWasteQty?: number;
};

export type CosteraInput = {
  period: {
    from: string;
    to: string;
  };
  locationId: string;
  targetFoodCostPct: number;
  ingredients: Ingredient[];
  menuItems: MenuItem[];
  sales: Sale[];
  inventory: InventoryPosition[];
};

export type IngredientVariance = {
  ingredientId: string;
  ingredient: string;
  unit: Unit;
  theoreticalQty: number;
  actualUsageQty: number;
  knownWasteQty: number;
  unexplainedQty: number;
  unitCost: number;
  unexplainedValue: number;
  theoreticalValue: number;
  actualValue: number;
  variancePct: number | null;
  risk: "Low" | "Medium" | "High";
};

export type CosteraAnalysis = {
  period: CosteraInput["period"];
  locationId: string;
  totals: {
    netSales: number;
    theoreticalCost: number;
    actualCost: number;
    knownWasteCost: number;
    unexplainedCost: number;
    theoreticalFoodCostPct: number;
    actualFoodCostPct: number;
    targetFoodCostPct: number;
    targetGapPp: number;
  };
  ingredientVariance: IngredientVariance[];
  dataQuality: {
    missingMenuItems: string[];
    missingIngredients: string[];
    salesCount: number;
    mappedSalesCount: number;
  };
};
