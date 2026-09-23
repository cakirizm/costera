import { describe, it, expect } from "vitest";
import { buildMobileOverview } from "./overview";
import type { CosteraInput } from "@/lib/costera/types";

const sampleInput: CosteraInput = {
  period: { from: "2024-09-01", to: "2024-09-22" },
  locationId: "all",
  targetFoodCostPct: 25,
  ingredients: [
    { id: "beef", name: "Minced Beef", unit: "kg", unitCost: 12 },
    { id: "cheese", name: "Mozzarella", unit: "kg", unitCost: 8 },
  ],
  menuItems: [
    { id: "burger", name: "Burger", sellingPrice: 15, recipe: [{ ingredientId: "beef", quantity: 0.25 }] },
    { id: "pizza", name: "Pizza", sellingPrice: 18, recipe: [{ ingredientId: "cheese", quantity: 0.3 }] },
  ],
  sales: [
    { id: "s1", menuItemId: "burger", quantity: 200, channel: "Dine-in", locationId: "loc1" },
    { id: "s2", menuItemId: "pizza", quantity: 150, channel: "Delivery", locationId: "loc1" },
  ],
  inventory: [
    { ingredientId: "beef", openingQty: 100, purchasesQty: 50, closingQty: 80, knownWasteQty: 2, transferInQty: 0, transferOutQty: 0 },
    { ingredientId: "cheese", openingQty: 60, purchasesQty: 30, closingQty: 40, knownWasteQty: 1, transferInQty: 0, transferOutQty: 0 },
  ],
};

const now = new Date("2024-09-22T12:00:00Z");

describe("buildMobileOverview", () => {
  it("returns restaurant-scoped overview with kpis", () => {
    const result = buildMobileOverview({
      restaurantId: "r1", locationId: null, input: sampleInput,
      source: { kind: "IMPORT", provider: "CSV Upload", syncedAt: now }, expenses: [], now,
    });
    expect(result.restaurantId).toBe("r1");
    expect(result.scope).toBe("restaurant");
    expect(result.kpis).not.toBeNull();
    expect(result.kpis!.netSales).toBeGreaterThan(0);
    expect(result.kpis!.targetFoodCostPct).toBe(25);
    expect(result.kpis!.unexplainedCost).not.toBeNull();
    expect(result.kpis!.operatingExpenses).toBe(0);
  });

  it("includes channels sorted by sales", () => {
    const result = buildMobileOverview({
      restaurantId: "r1", locationId: null, input: sampleInput,
      source: null, expenses: [], now,
    });
    expect(result.channels.length).toBe(2);
    expect(result.channels[0].sales).toBeGreaterThanOrEqual(result.channels[1].sales);
  });

  it("returns null kpis when no input", () => {
    const result = buildMobileOverview({
      restaurantId: "r1", locationId: null, input: null,
      source: null, expenses: [], now,
    });
    expect(result.kpis).toBeNull();
    expect(result.channels).toEqual([]);
    expect(result.alerts).toEqual([]);
  });

  it("includes operating expenses from expense records", () => {
    const expenses = [
      { amount: 500, incurredOn: new Date("2024-09-10") },
      { amount: 300, incurredOn: new Date("2024-09-15") },
      { amount: 1000, incurredOn: new Date("2024-08-15") },
    ];
    const result = buildMobileOverview({
      restaurantId: "r1", locationId: null, input: sampleInput,
      source: null, expenses, now,
    });
    expect(result.kpis!.operatingExpenses).toBe(800);
  });

  it("sets source state correctly", () => {
    const imported = buildMobileOverview({
      restaurantId: "r1", locationId: null, input: null,
      source: { kind: "IMPORT", provider: "CSV", syncedAt: now }, expenses: [], now,
    });
    expect(imported.source!.state).toBe("imported");

    const demo = buildMobileOverview({
      restaurantId: "r1", locationId: null, input: null,
      source: { kind: "DEMO", provider: "Demo", syncedAt: now }, expenses: [], now,
    });
    expect(demo.source!.state).toBe("demo");
  });

  it("scopes to branch when locationId provided", () => {
    const result = buildMobileOverview({
      restaurantId: "r1", locationId: "loc1", input: sampleInput,
      source: null, expenses: [], now,
    });
    expect(result.scope).toBe("branch-sales-only");
    expect(result.kpis!.unexplainedCost).toBeNull();
    expect(result.kpis!.operatingExpenses).toBeNull();
  });

  it("generates alerts for high-variance ingredients", () => {
    const result = buildMobileOverview({
      restaurantId: "r1", locationId: null, input: sampleInput,
      source: null, expenses: [], now,
    });
    const varianceAlerts = result.alerts.filter(a => a.kind === "variance");
    expect(varianceAlerts.length).toBeGreaterThan(0);
    for (const a of varianceAlerts) {
      expect(a.severity).toMatch(/high|medium/);
    }
  });
});
