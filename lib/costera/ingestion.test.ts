import { describe, it, expect } from "vitest";
import {
  parseNumber,
  normalizeHeader,
  detectDelimiter,
  parseDelimited,
  inferMapping,
  slug,
  buildCosteraInput,
} from "./ingestion";

describe("parseNumber", () => {
  it("parses plain numbers", () => expect(parseNumber("1234.56")).toBe(1234.56));
  it("parses Turkish/EU format 1.234,56", () => expect(parseNumber("1.234,56")).toBe(1234.56));
  it("parses US format 1,234.56", () => expect(parseNumber("1,234.56")).toBe(1234.56));
  it("strips currency symbols", () => expect(parseNumber("$1,000")).toBe(1000));
  it("handles the ₺ symbol and spaces", () => expect(parseNumber("₺ 2 500,75")).toBe(2500.75));
  it("treats parentheses as negative", () => expect(parseNumber("(500)")).toBe(-500));
  it("returns 0 for empty or garbage input", () => {
    expect(parseNumber("")).toBe(0);
    expect(parseNumber("abc")).toBe(0);
    expect(parseNumber(null)).toBe(0);
  });
});

describe("normalizeHeader", () => {
  it("lowercases and transliterates Turkish characters", () => {
    expect(normalizeHeader("Ürün Adı")).toBe("urun adi");
    expect(normalizeHeader("Şube")).toBe("sube");
  });
  it("collapses separators to single spaces", () => {
    expect(normalizeHeader("net_sales")).toBe("net sales");
    expect(normalizeHeader("Unit-Cost")).toBe("unit cost");
  });
});

describe("detectDelimiter", () => {
  it("detects comma, semicolon, tab and pipe", () => {
    expect(detectDelimiter("a,b,c")).toBe(",");
    expect(detectDelimiter("a;b;c")).toBe(";");
    expect(detectDelimiter("a\tb\tc")).toBe("\t");
    expect(detectDelimiter("a|b|c")).toBe("|");
  });
});

describe("parseDelimited", () => {
  it("parses headers and data rows", () => {
    const t = parseDelimited("a,b\n1,2\n3,4");
    expect(t.headers).toEqual(["a", "b"]);
    expect(t.rows).toHaveLength(2);
    expect(t.rows[0]).toEqual({ a: "1", b: "2" });
  });

  it("respects quoted fields that contain the delimiter", () => {
    const t = parseDelimited('name,note\n"Doe, John",hi');
    expect(t.rows[0].name).toBe("Doe, John");
    expect(t.rows[0].note).toBe("hi");
  });

  it("skips fully blank lines", () => {
    const t = parseDelimited("a,b\n1,2\n\n3,4");
    expect(t.rows).toHaveLength(2);
  });
});

describe("inferMapping", () => {
  it("maps POS headers via aliases", () => {
    const m = inferMapping("pos", ["Product Name", "Qty", "Net Sales", "Channel"]);
    expect(m.item).toBe("Product Name");
    expect(m.quantity).toBe("Qty");
    expect(m.netSales).toBe("Net Sales");
    expect(m.channel).toBe("Channel");
  });

  it("maps Turkish inventory headers", () => {
    const m = inferMapping("inventory", ["Malzeme", "Açılış", "Alış", "Kapanış"]);
    expect(m.ingredient).toBe("Malzeme");
    expect(m.opening).toBe("Açılış");
    expect(m.purchases).toBe("Alış");
    expect(m.closing).toBe("Kapanış");
  });
});

describe("slug", () => {
  it("produces a stable slug from a name", () => {
    expect(slug("Minced Beef")).toBe("minced-beef");
    expect(slug("Zeytinyağı")).toBe("zeytinyagi");
  });
});

describe("buildCosteraInput", () => {
  const pos = parseDelimited("Item,Qty,Channel\nBurger,10,Dine-in");
  const recipes = parseDelimited(
    "Menu Item,Ingredient,Recipe Qty,Unit,Unit Cost,Selling Price\nBurger,Beef,180,g,33,18",
  );
  const inventory = parseDelimited(
    "Ingredient,Opening Stock,Purchases,Closing Stock,Unit Cost,Unit\nBeef,10,5,12,33,kg",
  );

  const built = buildCosteraInput({
    pos,
    recipes,
    inventory,
    mappings: {
      pos: inferMapping("pos", pos.headers),
      recipes: inferMapping("recipes", recipes.headers),
      inventory: inferMapping("inventory", inventory.headers),
    },
    targetFoodCostPct: 25,
  });

  it("builds one menu item with the given selling price", () => {
    expect(built.input.menuItems).toHaveLength(1);
    expect(built.input.menuItems[0].sellingPrice).toBe(18);
  });

  it("converts recipe grams to kilograms (180g -> 0.18kg)", () => {
    expect(built.input.menuItems[0].recipe[0].quantity).toBeCloseTo(0.18, 5);
  });

  it("includes the ingredient and the sale", () => {
    expect(built.input.ingredients.some((i) => i.name === "Beef")).toBe(true);
    expect(built.input.sales).toHaveLength(1);
    expect(built.input.sales[0].quantity).toBe(10);
  });

  it("produces an input the engine can analyze", () => {
    expect(built.input.targetFoodCostPct).toBe(25);
    expect(built.stats.mappedMenuItems).toBe(1);
  });
});
