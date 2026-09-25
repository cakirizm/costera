import { describe, expect, it } from "vitest";
import { allocate, moneyMinor, roundMinor, toMajor, toMinor } from "./money";
import { changeFor, priceLine, priceOrder, remainingDue, taxFromInclusive } from "./pricing";

describe("money", () => {
  it("converts major to minor without float drift", () => {
    expect(toMinor(0.1 + 0.2)).toBe(30);
    expect(toMinor(19.99)).toBe(1999);
    expect(toMinor(1.005)).toBe(101);
    expect(toMajor(1999)).toBe(19.99);
  });

  it("rounds half away from zero", () => {
    expect(roundMinor(2.5)).toBe(3);
    expect(roundMinor(-2.5)).toBe(-3);
  });

  it("allocates so the parts always sum to the total", () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(100, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(100);
    expect(allocate(7, [5000, 2500, 2500]).reduce((a, b) => a + b, 0)).toBe(7);
    expect(allocate(50, [])).toEqual([]);
    expect(allocate(50, [0, 0])).toEqual([50, 0]);
  });
});

describe("taxFromInclusive", () => {
  it("extracts VAT from a tax-inclusive price", () => {
    // 110.00 at 10% inclusive -> 10.00 tax
    expect(taxFromInclusive(11000, 10)).toBe(1000);
    // 120.00 at 20% inclusive -> 20.00 tax
    expect(taxFromInclusive(12000, 20)).toBe(2000);
  });

  it("returns zero for a zero rate or a zero base", () => {
    expect(taxFromInclusive(11000, 0)).toBe(0);
    expect(taxFromInclusive(0, 10)).toBe(0);
  });
});

describe("priceLine", () => {
  it("multiplies modifiers per unit", () => {
    const line = priceLine({
      quantity: 3,
      unitPriceMinor: 10000,
      taxRatePct: 10,
      modifiers: [{ priceMinor: 500 }, { priceMinor: 250, quantity: 2 }],
    });
    expect(line.modifiersMinor).toBe(3 * (500 + 500));
    expect(line.grossMinor).toBe(3 * 11000);
    expect(line.lineTotalMinor).toBe(33000);
  });

  it("clamps a discount to the line gross", () => {
    const line = priceLine({ quantity: 1, unitPriceMinor: 5000, taxRatePct: 10, discountMinor: 9999 });
    expect(line.discountMinor).toBe(5000);
    expect(line.lineTotalMinor).toBe(0);
    expect(line.taxMinor).toBe(0);
  });

  it("charges nothing for a comped line but keeps the give-away visible", () => {
    const line = priceLine({ quantity: 2, unitPriceMinor: 4000, taxRatePct: 10, isComped: true });
    expect(line.grossMinor).toBe(8000);
    expect(line.discountMinor).toBe(8000);
    expect(line.lineTotalMinor).toBe(0);
  });

  it("drops a voided line out of every total", () => {
    const line = priceLine({ quantity: 2, unitPriceMinor: 4000, taxRatePct: 10, isVoid: true });
    expect(line.grossMinor).toBe(0);
    expect(line.discountMinor).toBe(0);
    expect(line.lineTotalMinor).toBe(0);
  });
});

describe("priceOrder", () => {
  it("totals a plain single-rate order", () => {
    const order = priceOrder({
      lines: [
        { quantity: 2, unitPriceMinor: 12000, taxRatePct: 10 },
        { quantity: 1, unitPriceMinor: 8000, taxRatePct: 10 },
      ],
    });
    expect(order.subtotalMinor).toBe(32000);
    expect(order.discountMinor).toBe(0);
    expect(order.totalMinor).toBe(32000);
    expect(order.taxMinor).toBe(taxFromInclusive(32000, 10));
    expect(order.taxBreakdown).toHaveLength(1);
  });

  it("splits tax into buckets per rate, as the OKC device needs", () => {
    const order = priceOrder({
      lines: [
        { quantity: 1, unitPriceMinor: 11000, taxRatePct: 10 },
        { quantity: 1, unitPriceMinor: 24000, taxRatePct: 20 },
      ],
    });
    expect(order.taxBreakdown.map((b) => b.taxRatePct)).toEqual([10, 20]);
    expect(order.taxBreakdown[0].taxMinor).toBe(1000);
    expect(order.taxBreakdown[1].taxMinor).toBe(4000);
    expect(order.taxMinor).toBe(5000);
  });

  it("spreads an order discount across lines with no lost kurus", () => {
    const order = priceOrder({
      lines: [
        { quantity: 1, unitPriceMinor: 3333, taxRatePct: 10 },
        { quantity: 1, unitPriceMinor: 3333, taxRatePct: 10 },
        { quantity: 1, unitPriceMinor: 3334, taxRatePct: 10 },
      ],
      orderDiscountMinor: 1000,
    });
    const spread = order.lines.reduce((sum, l) => sum + l.discountMinor, 0);
    expect(spread).toBe(1000);
    expect(order.discountMinor).toBe(1000);
    expect(order.totalMinor).toBe(10000 - 1000);
    expect(order.lines.reduce((sum, l) => sum + l.lineTotalMinor, 0)).toBe(order.totalMinor);
  });

  it("never discounts more than the order is worth", () => {
    const order = priceOrder({
      lines: [{ quantity: 1, unitPriceMinor: 5000, taxRatePct: 10 }],
      orderDiscountMinor: 999999,
    });
    expect(order.discountMinor).toBe(5000);
    expect(order.totalMinor).toBe(0);
    expect(order.taxMinor).toBe(0);
  });

  it("applies the service charge after discounts and taxes it", () => {
    const order = priceOrder({
      lines: [{ quantity: 1, unitPriceMinor: 10000, taxRatePct: 10 }],
      orderDiscountMinor: 2000,
      servicePct: 10,
      serviceTaxRatePct: 10,
    });
    expect(order.serviceMinor).toBe(800);
    expect(order.totalMinor).toBe(8000 + 800);
    expect(order.taxMinor).toBe(taxFromInclusive(8000, 10) + taxFromInclusive(800, 10));
  });

  it("ignores voided lines entirely", () => {
    const order = priceOrder({
      lines: [
        { quantity: 1, unitPriceMinor: 10000, taxRatePct: 10 },
        { quantity: 1, unitPriceMinor: 5000, taxRatePct: 10, isVoid: true },
      ],
    });
    expect(order.subtotalMinor).toBe(10000);
    expect(order.totalMinor).toBe(10000);
  });

  it("handles an empty order", () => {
    const order = priceOrder({ lines: [] });
    expect(order.totalMinor).toBe(0);
    expect(order.taxBreakdown).toEqual([]);
  });
});

describe("payment helpers", () => {
  it("reports what is still due", () => {
    expect(remainingDue(10000, 4000)).toBe(6000);
    expect(remainingDue(10000, 12000)).toBe(0);
  });

  it("never returns negative change", () => {
    expect(changeFor(5000, 3500)).toBe(1500);
    expect(changeFor(3000, 3500)).toBe(0);
  });
});

describe("moneyMinor", () => {
  it("groups numbers the way the currency expects", () => {
    expect(moneyMinor(3600, "USD")).toBe("$36.00");
    expect(moneyMinor(3600, "TRY")).toBe("₺36,00");
    expect(moneyMinor(123456, "USD")).toBe("$1,234.56");
  });

  it("keeps the minor units a cashier counts", () => {
    expect(moneyMinor(5, "USD")).toBe("$0.05");
    expect(moneyMinor(-250, "USD")).toBe("-$2.50");
  });
});
