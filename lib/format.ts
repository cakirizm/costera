const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  TRY: "₺",
  AED: "د.إ",
  SAR: "﷼",
};

export function money(n: number, currency = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return symbol + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function pct(n: number): string {
  return n.toFixed(1) + "%";
}

export function qty(n: number, unit: string): string {
  return (n > 0 ? "+" : "") + n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + unit;
}
