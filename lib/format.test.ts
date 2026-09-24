import { describe, it, expect } from "vitest";
import { money, pct, qty } from "./format";

describe("money", () => {
  it("formats with default USD", () => {
    expect(money(1234)).toBe("$1,234");
  });

  it("uses absolute value", () => {
    expect(money(-500)).toBe("$500");
  });

  it("formats with TRY symbol", () => {
    expect(money(9999, "TRY")).toBe("₺9,999");
  });

  it("formats with EUR symbol", () => {
    expect(money(100, "EUR")).toBe("€100");
  });

  it("formats with GBP symbol", () => {
    expect(money(250, "GBP")).toBe("£250");
  });

  it("formats with AED symbol", () => {
    expect(money(1000, "AED")).toBe("د.إ1,000");
  });

  it("falls back to currency code for unknown currencies", () => {
    expect(money(500, "JPY")).toBe("JPY 500");
  });

  it("handles zero", () => {
    expect(money(0)).toBe("$0");
  });
});

describe("pct", () => {
  it("formats percentage with one decimal", () => {
    expect(pct(25.678)).toBe("25.7%");
  });

  it("handles zero", () => {
    expect(pct(0)).toBe("0.0%");
  });
});

describe("qty", () => {
  it("adds + prefix for positive", () => {
    expect(qty(3.5, "kg")).toBe("+3.5 kg");
  });

  it("no prefix for negative", () => {
    expect(qty(-2.1, "lt")).toBe("-2.1 lt");
  });

  it("no prefix for zero", () => {
    expect(qty(0, "kg")).toBe("0 kg");
  });
});
