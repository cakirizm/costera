import type { CosteraInput } from "./types";

export const sampleInput: CosteraInput = {
  period: { from: "2026-09-01", to: "2026-09-22" },
  locationId: "all",
  targetFoodCostPct: 25,
  ingredients: [
    { id: "beef", name: "Minced Beef", unit: "kg", unitCost: 33 },
    { id: "chicken", name: "Chicken Breast", unit: "kg", unitCost: 16 },
    { id: "oil", name: "Olive Oil", unit: "L", unitCost: 13 },
    { id: "mozzarella", name: "Mozzarella", unit: "kg", unitCost: 13 },
    { id: "tomato", name: "Tomatoes", unit: "kg", unitCost: 2.1 },
  ],
  menuItems: [
    {
      id: "burger",
      name: "Classic Burger",
      sellingPrice: 18,
      recipe: [
        { ingredientId: "beef", quantity: 0.18 },
        { ingredientId: "tomato", quantity: 0.04 },
      ],
    },
    {
      id: "caesar",
      name: "Chicken Caesar",
      sellingPrice: 16,
      recipe: [
        { ingredientId: "chicken", quantity: 0.16 },
        { ingredientId: "oil", quantity: 0.012 },
      ],
    },
    {
      id: "pizza",
      name: "Margherita Pizza",
      sellingPrice: 15,
      recipe: [
        { ingredientId: "mozzarella", quantity: 0.12 },
        { ingredientId: "tomato", quantity: 0.08 },
        { ingredientId: "oil", quantity: 0.01 },
      ],
    },
  ],
  sales: [
    { id: "s1", menuItemId: "burger", quantity: 728, channel: "Dine-in", locationId: "downtown" },
    { id: "s2", menuItemId: "caesar", quantity: 1188, channel: "Talabat", locationId: "downtown" },
    { id: "s3", menuItemId: "pizza", quantity: 608, channel: "Deliveroo", locationId: "marina" },
    { id: "s4", menuItemId: "burger", quantity: 640, channel: "Careem", locationId: "jumeirah" },
    { id: "s5", menuItemId: "pizza", quantity: 500, channel: "Dine-in", locationId: "jumeirah" },
  ],
  inventory: [
    { ingredientId: "beef", openingQty: 210, purchasesQty: 160, closingQty: 111, knownWasteQty: 13 },
    { ingredientId: "chicken", openingQty: 250, purchasesQty: 180, closingQty: 218, knownWasteQty: 11 },
    { ingredientId: "oil", openingQty: 52, purchasesQty: 45, closingQty: 59, knownWasteQty: 2 },
    { ingredientId: "mozzarella", openingQty: 88, purchasesQty: 80, closingQty: 94, knownWasteQty: 3 },
    { ingredientId: "tomato", openingQty: 110, purchasesQty: 120, closingQty: 86, knownWasteQty: 5 },
  ],
};
