import { describe, it, expect } from "vitest";
import { analyzeCost } from "./engine";
import { sampleInput } from "./sample";

describe("analyzeCost (sample data)", () => {
  const a = analyzeCost(sampleInput);

  it("computes net sales from quantity × selling price", () => {
    // 728*18 + 1188*16 + 608*15 + 640*18 + 500*15 = 60252
    expect(a.totals.netSales).toBe(60252);
  });

  it("keeps the configured target food cost", () => {
    expect(a.totals.targetFoodCostPct).toBe(25);
  });

  it("computes actual food cost above target and a positive gap", () => {
    expect(a.totals.actualFoodCostPct).toBeGreaterThan(25);
    expect(a.totals.targetGapPp).toBeCloseTo(a.totals.actualFoodCostPct - 25, 1);
  });

  it("reports a positive unexplained cost", () => {
    expect(a.totals.unexplainedCost).toBeGreaterThan(0);
  });

  it("ranks ingredient variance by financial impact (beef first)", () => {
    expect(a.ingredientVariance[0].ingredient).toBe("Minced Beef");
    // sorted descending by absolute unexplained value
    for (let i = 1; i < a.ingredientVariance.length; i += 1) {
      expect(Math.abs(a.ingredientVariance[i - 1].unexplainedValue)).toBeGreaterThanOrEqual(
        Math.abs(a.ingredientVariance[i].unexplainedValue),
      );
    }
  });

  it("share of gap percentages sum to ~100 for positive-variance ingredients", () => {
    const sum = a.ingredientVariance.reduce((s, r) => s + r.shareOfGapPct, 0);
    expect(sum).toBeGreaterThan(99);
    expect(sum).toBeLessThan(101);
  });

  it("maps every sample sale to a menu item", () => {
    expect(a.dataQuality.mappedSalesCount).toBe(sampleInput.sales.length);
    expect(a.dataQuality.missingMenuItems).toHaveLength(0);
  });
});

describe("analyzeCost (edge cases)", () => {
  it("returns zeroed totals for empty input", () => {
    const empty = analyzeCost({
      period: { from: "2026-01-01", to: "2026-01-31" },
      locationId: "all",
      targetFoodCostPct: 25,
      ingredients: [],
      menuItems: [],
      sales: [],
      inventory: [],
    });
    expect(empty.totals.netSales).toBe(0);
    expect(empty.totals.actualFoodCostPct).toBe(0);
    expect(empty.ingredientVariance).toHaveLength(0);
  });

  it("flags sales with an unknown menu item as missing", () => {
    const result = analyzeCost({
      ...sampleInput,
      sales: [{ id: "x", menuItemId: "ghost", quantity: 5, channel: "Dine-in", locationId: "a" }],
    });
    expect(result.dataQuality.missingMenuItems).toContain("ghost");
    expect(result.dataQuality.mappedSalesCount).toBe(0);
    expect(result.totals.netSales).toBe(0);
  });

  it("prefers explicit netSales over quantity × price when provided", () => {
    const result = analyzeCost({
      ...sampleInput,
      sales: [{ id: "s", menuItemId: "burger", quantity: 1, channel: "Dine-in", locationId: "a", netSales: 999 }],
    });
    expect(result.totals.netSales).toBe(999);
  });
});
