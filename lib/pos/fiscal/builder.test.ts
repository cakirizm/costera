import { describe, expect, it } from "vitest";
import { buildReceiptRequest, paymentsBalance, type BuilderLine } from "./builder";

const line = (over: Partial<BuilderLine> = {}): BuilderLine => ({
  name: "Izgara Kofte",
  quantity: 1,
  unitPriceMinor: 28500,
  modifiersMinor: 0,
  discountMinor: 0,
  taxRatePct: 10,
  isComped: false,
  isVoid: false,
  department: 1,
  ...over,
});

const input = (lines: BuilderLine[], over = {}) => ({
  reference: "ticket-1",
  currency: "TRY",
  orderDiscountMinor: 0,
  lines,
  payments: [{ method: "CASH" as const, amountMinor: 0 }],
  ...over,
});

describe("buildReceiptRequest", () => {
  it("carries every sold line with its department", () => {
    const request = buildReceiptRequest(
      input([line(), line({ name: "Bira", taxRatePct: 20, department: 2, unitPriceMinor: 18000 })]),
    );
    expect(request.lines).toHaveLength(2);
    expect(request.lines[1].department).toBe(2);
    expect(request.lines[1].taxRatePct).toBe(20);
  });

  it("falls back to department 1 when a tax group names none", () => {
    const request = buildReceiptRequest(input([line({ department: null })]));
    expect(request.lines[0].department).toBe(1);
  });

  it("leaves voided lines off the fiscal record", () => {
    const request = buildReceiptRequest(input([line(), line({ name: "Iptal", isVoid: true })]));
    expect(request.lines.map((l) => l.name)).toEqual(["Izgara Kofte"]);
  });

  it("leaves comped lines off too - a give-away is not a sale", () => {
    const request = buildReceiptRequest(input([line(), line({ name: "Ikram", isComped: true })]));
    expect(request.lines.map((l) => l.name)).toEqual(["Izgara Kofte"]);
  });

  it("totals agree with what the guest was charged", () => {
    const request = buildReceiptRequest(input([line({ quantity: 2 }), line({ name: "Ayran", unitPriceMinor: 4500 })]));
    expect(request.totalMinor).toBe(2 * 28500 + 4500);
    const printed = request.lines.reduce((sum, l) => sum + l.totalMinor, 0);
    expect(printed).toBe(request.totalMinor);
  });

  it("spreads a ticket discount into the printed line totals", () => {
    const request = buildReceiptRequest(input([line(), line()], { orderDiscountMinor: 5000 }));
    expect(request.discountMinor).toBe(5000);
    const printed = request.lines.reduce((sum, l) => sum + l.totalMinor, 0);
    expect(printed).toBe(2 * 28500 - 5000);
    expect(printed).toBe(request.totalMinor);
  });

  it("includes modifiers in the line the device prints", () => {
    const request = buildReceiptRequest(input([line({ modifiersMinor: 3000 })]));
    expect(request.lines[0].totalMinor).toBe(31500);
  });

  it("extracts the VAT rather than adding it - prices are tax inclusive", () => {
    const request = buildReceiptRequest(input([line({ unitPriceMinor: 11000 })]));
    expect(request.totalMinor).toBe(11000);
    expect(request.taxMinor).toBe(1000);
  });

  it("drops zero payments so the device is not handed empty tenders", () => {
    const request = buildReceiptRequest(
      input([line()], { payments: [{ method: "CASH", amountMinor: 0 }, { method: "CARD", amountMinor: 28500 }] }),
    );
    expect(request.payments).toEqual([{ method: "CARD", amountMinor: 28500 }]);
  });
});

describe("paymentsBalance", () => {
  const request = (payments: { method: "CASH" | "CARD"; amountMinor: number }[]) =>
    buildReceiptRequest(input([line()], { payments }));

  it("accepts a split that adds up", () => {
    expect(
      paymentsBalance(request([{ method: "CASH", amountMinor: 10000 }, { method: "CARD", amountMinor: 18500 }])),
    ).toBe(true);
  });

  it("refuses a short or over tender", () => {
    expect(paymentsBalance(request([{ method: "CASH", amountMinor: 28400 }]))).toBe(false);
    expect(paymentsBalance(request([{ method: "CASH", amountMinor: 28600 }]))).toBe(false);
  });
});
