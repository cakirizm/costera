import { describe, expect, it } from "vitest";
import {
  centre,
  money,
  renderKitchenTicket,
  renderPreview,
  renderReceipt,
  rule,
  twoColumn,
} from "./escpos.js";

const text = (bytes: Uint8Array) =>
  new TextDecoder().decode(bytes).replace(/[\x00-\x09\x0b-\x1f]/g, "");

describe("layout helpers", () => {
  it("pads two columns to the paper width", () => {
    expect(twoColumn("Burger", "18.00 TL", 20)).toBe("Burger      18.00 TL");
    expect(twoColumn("Burger", "18.00 TL", 20)).toHaveLength(20);
  });

  it("truncates a long name instead of wrapping the price onto the next line", () => {
    const line = twoColumn("A very long product name indeed", "999.00 TL", 20);
    expect(line).toContain("999.00 TL");
    expect(line.length).toBeLessThanOrEqual(20);
  });

  it("centres and rules to the configured width", () => {
    expect(centre("ABC", 9)).toBe("   ABC");
    expect(rule(5)).toBe("-----");
  });
});

describe("money", () => {
  it("always shows the minor units", () => {
    expect(money(1850, "TRY")).toBe("18.50 TL");
    expect(money(5, "USD")).toBe("0.05 $");
    expect(money(-250, "TRY")).toBe("-2.50 TL");
  });

  it("falls back to the code for a currency it has no symbol for", () => {
    expect(money(1000, "AED")).toBe("10.00 AED");
  });
});

describe("renderReceipt", () => {
  const payload = {
    venue: "Demo Restaurant",
    currency: "TRY",
    orderCode: 12,
    table: "S3",
    closedAt: null,
    totalMinor: 45000,
    taxMinor: 4091,
    discountMinor: 5000,
    lines: [
      { name: "Izgara Kofte", quantity: 2, lineTotalMinor: 57000 },
      { name: "Ayran", quantity: 1, lineTotalMinor: 4500 },
    ],
  };

  it("prints the venue, ticket number, table and every line", () => {
    const out = text(renderReceipt(payload, 42));
    expect(out).toContain("Demo Restaurant");
    expect(out).toContain("ADISYON #12");
    expect(out).toContain("S3");
    expect(out).toContain("2x Izgara Kofte");
    expect(out).toContain("570.00 TL");
    expect(out).toContain("TOPLAM");
  });

  it("shows a discount line only when there is one", () => {
    expect(text(renderReceipt(payload, 42))).toContain("Iskonto");
    expect(text(renderReceipt({ ...payload, discountMinor: 0 }, 42))).not.toContain("Iskonto");
  });

  it("ends with a cut command", () => {
    const bytes = renderReceipt(payload, 42);
    expect(Array.from(bytes.slice(-3))).toEqual([0x1d, 0x56, 0x00]);
  });

  it("starts with the printer reset", () => {
    expect(Array.from(renderReceipt(payload, 42).slice(0, 2))).toEqual([0x1b, 0x40]);
  });
});

describe("renderKitchenTicket", () => {
  const payload = {
    station: "KITCHEN",
    orderCode: 7,
    table: "S1",
    sentAt: null,
    lines: [
      { name: "Adana Kebap", quantity: 2, note: "az acili" },
      { name: "Humus", quantity: 1, note: null },
    ],
  };

  it("prints the station, ticket and notes", () => {
    const out = text(renderKitchenTicket(payload, 42));
    expect(out).toContain("KITCHEN");
    expect(out).toContain("#7");
    expect(out).toContain("2x Adana Kebap");
    expect(out).toContain(">> az acili");
  });

  it("never prints prices - the cook does not need them", () => {
    expect(text(renderKitchenTicket(payload, 42))).not.toContain("TL");
  });
});

describe("renderPreview", () => {
  it("renders the same layout as readable text", () => {
    const preview = renderPreview("KITCHEN", { station: "BAR", orderCode: 3, lines: [] }, 32);
    expect(preview).toContain("BAR");
    expect(preview).toContain("#3");
  });
});
