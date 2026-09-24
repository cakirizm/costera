export function money(n: number): string {
  return "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function pct(n: number): string {
  return n.toFixed(1) + "%";
}

export function qty(n: number, unit: string): string {
  return (n > 0 ? "+" : "") + n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + unit;
}
