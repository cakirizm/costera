import { describe, expect, it } from "vitest";
import { arabicCopy, isAppLocale, localePath, tx } from "./locale";

describe("Arabic localization", () => {
  it("supports Arabic without changing English and Turkish translations", () => {
    expect(tx("ar", "Inventory", "Stok")).toBe("المخزون");
    expect(tx("en", "Inventory", "Stok")).toBe("Inventory");
    expect(tx("tr", "Inventory", "Stok")).toBe("Stok");
    expect(isAppLocale("ar")).toBe(true);
    expect(isAppLocale("fr")).toBe(false);
  });
  it("translates nested copy while preserving technical identifiers and the original", () => {
    const original = { items: [["inventory", "Inventory"]], amount: 5 };
    expect(arabicCopy(original)).toEqual({ items: [["inventory", "المخزون"]], amount: 5 });
    expect(original.items[0][1]).toBe("Inventory");
    expect(tx("ar", "User supplied restaurant name", "")).toBe("User supplied restaurant name");
  });
  it("builds matching public and authentication routes", () => {
    expect(localePath("ar")).toBe("/ar");
    expect(localePath("ar", "/register")).toBe("/ar/register");
    expect(localePath("tr", "/features")).toBe("/tr/features");
    expect(localePath("en", "/pricing")).toBe("/pricing");
  });
});
