import type { CosteraInput, Unit } from "./types";

export type Row = Record<string, string>;
export type SourceKind = "pos" | "recipes" | "inventory";
export type Mapping = Record<string, string>;

export type ParsedTable = {
  headers: string[];
  rows: Row[];
  delimiter: string;
};

export const schemas = {
  pos: {
    label: "POS / Sales",
    required: ["item", "quantity"],
    fields: [
      ["item", "Menu item / Product"],
      ["quantity", "Quantity sold"],
      ["netSales", "Net sales / Amount"],
      ["channel", "Channel"],
      ["location", "Branch / Location"],
      ["saleId", "Order / Row ID"],
    ],
  },
  recipes: {
    label: "Recipes / BOM",
    required: ["menuItem", "ingredient", "qty"],
    fields: [
      ["menuItem", "Menu item"],
      ["ingredient", "Ingredient"],
      ["qty", "Recipe quantity"],
      ["qtyUnit", "Recipe unit"],
      ["unitCost", "Ingredient unit cost"],
      ["sellingPrice", "Selling price"],
    ],
  },
  inventory: {
    label: "Inventory / Purchases",
    required: ["ingredient", "opening", "purchases", "closing"],
    fields: [
      ["ingredient", "Ingredient"],
      ["opening", "Opening stock"],
      ["purchases", "Purchases / Stock in"],
      ["transferIn", "Transfer in"],
      ["transferOut", "Transfer out"],
      ["closing", "Closing stock"],
      ["waste", "Known waste / spoilage"],
      ["unitCost", "Unit cost"],
      ["unit", "Stock unit"],
    ],
  },
} as const;

const aliases: Record<SourceKind, Record<string, string[]>> = {
  pos: {
    item: ["item","menu item","menu_item","product","product name","item name","urun","ürün","menu","product_name","name","description"],
    quantity: ["qty","quantity","adet","count","sold qty","sales qty","miktar","units","unit qty","item qty"],
    netSales: ["net sales","net_sales","sales","revenue","amount","total","tutar","net amount","net value","sales amount","line total"],
    channel: ["channel","source","platform","kanal","order source","sales channel","provider"],
    location: ["location","branch","store","sube","şube","outlet","restaurant","site"],
    saleId: ["id","order id","order_id","check id","ticket","receipt","receipt no","invoice no","transaction id"],
  },
  recipes: {
    menuItem: ["menu item","menu_item","product","item","item name","product name","urun","ürün","menu","dish","recipe name"],
    ingredient: ["ingredient","material","stock item","malzeme","raw material","inventory item","component"],
    qty: ["qty","quantity","recipe qty","amount","miktar","gramaj","usage","portion qty","component qty"],
    qtyUnit: ["unit","uom","recipe unit","birim","qty unit","quantity unit"],
    unitCost: ["unit cost","ingredient cost","cost per unit","birim maliyet","birim maliyeti","avg cost","average cost"],
    sellingPrice: ["selling price","price","menu price","sale price","satis fiyati","satış fiyatı","retail price"],
  },
  inventory: {
    ingredient: ["ingredient","material","stock item","malzeme","raw material","inventory item","item","product"],
    opening: ["opening","opening qty","beginning stock","opening stock","acilis","açılış","opening balance","begin qty"],
    purchases: ["purchases","purchase","received","goods receipt","alis","alış","purchased qty","stock in","receipts","grn qty","in qty"],
    transferIn: ["transfer in","transfer_in","transfer received","incoming transfer","transfer giris","transfer giriş"],
    transferOut: ["transfer out","transfer_out","transfer sent","outgoing transfer","transfer cikis","transfer çıkış"],
    closing: ["closing","closing qty","ending stock","closing stock","kapanis","kapanış","ending balance","final qty","stock on hand"],
    waste: ["waste","spoilage","fire","zayi","known waste","wastage","discard"],
    unitCost: ["unit cost","avg cost","average cost","cost","birim maliyet","birim maliyeti","weighted cost"],
    unit: ["unit","uom","birim","stock unit","base unit"],
  },
};

export function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[_\-./]+/g, " ")
    .replace(/\s+/g, " ");
}

function countDelimiter(line: string, delimiter: string): number {
  let quoted = false;
  let count = 0;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === '"') {
      if (quoted && line[i + 1] === '"') i += 1;
      else quoted = !quoted;
    } else if (!quoted && line[i] === delimiter) {
      count += 1;
    }
  }
  return count;
}

export function detectDelimiter(text: string): string {
  const line = text.split(/\r?\n/).find(Boolean) || "";
  const candidates = [",", ";", "\t", "|"];
  const scored = candidates
    .map((delimiter) => ({ delimiter, count: countDelimiter(line, delimiter) }))
    .sort((a, b) => b.count - a.count);
  return scored[0]?.delimiter || ",";
}

export function parseDelimited(text: string): ParsedTable {
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const pushField = () => {
    row.push(field.trim());
    field = "";
  };

  const pushRow = () => {
    if (row.some((x) => x !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === delimiter) {
      pushField();
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      pushField();
      pushRow();
      continue;
    }

    field += char;
  }

  pushField();
  pushRow();

  const rawHeaders = rows.shift() || [];
  const headers = rawHeaders.map((h, i) => h || "Column " + (i + 1));

  return {
    delimiter,
    headers,
    rows: rows.map((values) =>
      Object.fromEntries(headers.map((h, i) => [h, values[i] || ""])),
    ),
  };
}

export function inferMapping(kind: SourceKind, headers: string[]): Mapping {
  const normalized = headers.map((h) => [h, normalizeHeader(h)] as const);
  const result: Mapping = {};

  for (const [field, names] of Object.entries(aliases[kind])) {
    const normalizedAliases = names.map(normalizeHeader);
    const exact = normalized.find(([, h]) => normalizedAliases.includes(h));
    const partial = normalized.find(([, h]) =>
      normalizedAliases.some((a) => h.includes(a) || a.includes(h)),
    );
    const match = exact || partial;
    if (match) result[field] = match[0];
  }

  return result;
}

export function parseNumber(raw: unknown): number {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  let value = String(raw || "").trim();
  if (!value) return 0;

  const negative = /^\(.*\)$/.test(value);
  value = value.replace(/[()%]/g, "").replace(/[A-Za-z$€£₺\s]/g, "");

  const comma = value.lastIndexOf(",");
  const dot = value.lastIndexOf(".");

  if (comma >= 0 && dot >= 0) {
    if (comma > dot) value = value.replace(/\./g, "").replace(",", ".");
    else value = value.replace(/,/g, "");
  } else if (comma >= 0) {
    const tail = value.length - comma - 1;
    if (tail > 0 && tail <= 2) value = value.replace(/\./g, "").replace(",", ".");
    else value = value.replace(/,/g, "");
  } else {
    value = value.replace(/,/g, "");
  }

  const n = Number(value);
  return Number.isFinite(n) ? (negative ? -n : n) : 0;
}

export function slug(value: string): string {
  return normalizeHeader(value)
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "unknown";
}

function unitInfo(raw: string | undefined): { unit: Unit; factor: number } {
  const u = normalizeHeader(raw || "");
  if (["g","gr","gram","grams"].includes(u)) return { unit: "kg", factor: 0.001 };
  if (["kg","kilogram","kilograms"].includes(u)) return { unit: "kg", factor: 1 };
  if (["ml","milliliter","millilitre"].includes(u)) return { unit: "L", factor: 0.001 };
  if (["l","lt","liter","litre","liters","litres"].includes(u)) return { unit: "L", factor: 1 };
  return { unit: "pcs", factor: 1 };
}

function cell(row: Row, mapping: Mapping, field: string): string {
  const header = mapping[field];
  return header ? row[header] || "" : "";
}

export type BuildResult = {
  input: CosteraInput;
  warnings: string[];
  stats: {
    posRows: number;
    recipeRows: number;
    inventoryRows: number;
    mappedMenuItems: number;
    ingredients: number;
  };
};

export function buildCosteraInput(args: {
  pos: ParsedTable;
  recipes: ParsedTable;
  inventory: ParsedTable;
  mappings: Record<SourceKind, Mapping>;
  targetFoodCostPct: number;
  locationId?: string;
}): BuildResult {
  const pos = args.pos;
  const recipes = args.recipes;
  const inventory = args.inventory;
  const mappings = args.mappings;
  const warnings: string[] = [];

  const inventoryByIngredient = new Map<string, {
    name: string;
    unit: Unit;
    unitCost: number;
    opening: number;
    purchases: number;
    transferIn: number;
    transferOut: number;
    closing: number;
    waste: number;
  }>();

  for (const row of inventory.rows) {
    const name = cell(row, mappings.inventory, "ingredient").trim();
    if (!name) continue;
    const id = slug(name);
    const unit = unitInfo(cell(row, mappings.inventory, "unit")).unit;
    inventoryByIngredient.set(id, {
      name,
      unit,
      unitCost: parseNumber(cell(row, mappings.inventory, "unitCost")),
      opening: parseNumber(cell(row, mappings.inventory, "opening")),
      purchases: parseNumber(cell(row, mappings.inventory, "purchases")),
      transferIn: parseNumber(cell(row, mappings.inventory, "transferIn")),
      transferOut: parseNumber(cell(row, mappings.inventory, "transferOut")),
      closing: parseNumber(cell(row, mappings.inventory, "closing")),
      waste: parseNumber(cell(row, mappings.inventory, "waste")),
    });
  }

  const recipeGroups = new Map<string, {
    name: string;
    sellingPrice: number;
    lines: Map<string, { name: string; quantity: number; unit: Unit; unitCost: number }>;
  }>();

  for (const row of recipes.rows) {
    const menuName = cell(row, mappings.recipes, "menuItem").trim();
    const ingredientName = cell(row, mappings.recipes, "ingredient").trim();
    if (!menuName || !ingredientName) continue;

    const menuId = slug(menuName);
    const ingredientId = slug(ingredientName);
    const rawQty = parseNumber(cell(row, mappings.recipes, "qty"));
    const recipeUnit = unitInfo(cell(row, mappings.recipes, "qtyUnit"));
    const quantity = rawQty * recipeUnit.factor;

    const group = recipeGroups.get(menuId) || {
      name: menuName,
      sellingPrice: 0,
      lines: new Map<string, { name: string; quantity: number; unit: Unit; unitCost: number }>(),
    };

    group.sellingPrice = group.sellingPrice || parseNumber(cell(row, mappings.recipes, "sellingPrice"));
    const prior = group.lines.get(ingredientId);

    group.lines.set(ingredientId, {
      name: ingredientName,
      quantity: (prior?.quantity || 0) + quantity,
      unit: recipeUnit.unit,
      unitCost: prior?.unitCost || parseNumber(cell(row, mappings.recipes, "unitCost")),
    });

    recipeGroups.set(menuId, group);

    if (!inventoryByIngredient.has(ingredientId)) {
      inventoryByIngredient.set(ingredientId, {
        name: ingredientName,
        unit: recipeUnit.unit,
        unitCost: parseNumber(cell(row, mappings.recipes, "unitCost")),
        opening: 0,
        purchases: 0,
        transferIn: 0,
        transferOut: 0,
        closing: 0,
        waste: 0,
      });
      warnings.push('Ingredient "' + ingredientName + '" exists in recipe file but not inventory file.');
    }
  }

  const sales: CosteraInput["sales"] = [];
  const salesPriceAgg = new Map<string, { sales: number; qty: number }>();

  pos.rows.forEach((row, index) => {
    const itemName = cell(row, mappings.pos, "item").trim();
    if (!itemName) return;
    const menuItemId = slug(itemName);
    const quantity = parseNumber(cell(row, mappings.pos, "quantity"));
    const netSales = parseNumber(cell(row, mappings.pos, "netSales"));

    sales.push({
      id: cell(row, mappings.pos, "saleId") || "row-" + (index + 1),
      menuItemId,
      quantity,
      channel: cell(row, mappings.pos, "channel") || "Unknown",
      locationId: cell(row, mappings.pos, "location") || args.locationId || "default",
      ...(netSales ? { netSales } : {}),
    });

    if (netSales && quantity) {
      const agg = salesPriceAgg.get(menuItemId) || { sales: 0, qty: 0 };
      agg.sales += netSales;
      agg.qty += quantity;
      salesPriceAgg.set(menuItemId, agg);
    }
  });

  const ingredients = [...inventoryByIngredient.entries()].map(([id, x]) => {
    if (!x.unitCost) warnings.push('Missing unit cost for ingredient "' + x.name + '".');
    return { id, name: x.name, unit: x.unit, unitCost: x.unitCost };
  });

  const menuItems = [...recipeGroups.entries()].map(([id, group]) => {
    const inferred = salesPriceAgg.get(id);
    const sellingPrice = group.sellingPrice || (inferred && inferred.qty ? inferred.sales / inferred.qty : 0);
    if (!sellingPrice) warnings.push('Missing selling price for menu item "' + group.name + '".');

    return {
      id,
      name: group.name,
      sellingPrice,
      recipe: [...group.lines.entries()].map(([ingredientId, line]) => {
        const base = inventoryByIngredient.get(ingredientId);
        if (base && base.unit !== line.unit) {
          warnings.push('Unit mismatch for "' + line.name + '": recipe ' + line.unit + ', inventory ' + base.unit + ".");
        }
        return { ingredientId, quantity: line.quantity };
      }),
    };
  });

  return {
    input: {
      period: {
        from: new Date().toISOString().slice(0, 10),
        to: new Date().toISOString().slice(0, 10),
      },
      locationId: args.locationId || "all",
      targetFoodCostPct: args.targetFoodCostPct,
      ingredients,
      menuItems,
      sales,
      inventory: [...inventoryByIngredient.entries()].map(([ingredientId, x]) => ({
        ingredientId,
        openingQty: x.opening,
        purchasesQty: x.purchases,
        transferInQty: x.transferIn,
        transferOutQty: x.transferOut,
        closingQty: x.closing,
        knownWasteQty: x.waste,
      })),
    },
    warnings: [...new Set(warnings)],
    stats: {
      posRows: pos.rows.length,
      recipeRows: recipes.rows.length,
      inventoryRows: inventory.rows.length,
      mappedMenuItems: menuItems.length,
      ingredients: ingredients.length,
    },
  };
}
