/**
 * Minor-unit money helpers for the POS domain.
 *
 * Everything the cashier touches is an integer number of minor units (kurus,
 * cents). Float only reappears at the boundary where POS sales are projected
 * into the cost engine, which models money as Float.
 */

/** Round half away from zero. Math.round() rounds -0.5 to -0, which skews refunds. */
export function roundMinor(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

/**
 * 12.34 -> 1234.
 *
 * The multiply is normalised through toFixed first: 1.005 * 100 evaluates to
 * 100.49999999999999 in IEEE-754, which would silently round a price down by a
 * kurus. Fixing the representation to more decimals than a price can carry
 * restores the decimal value the operator actually typed.
 */
export function toMinor(major: number): number {
  return roundMinor(Number((major * 100).toFixed(4)));
}

/** 1234 -> 12.34. Used only at the Sale projection boundary. */
export function toMajor(minor: number): number {
  return minor / 100;
}

/**
 * Split `total` across `weights` so the parts always sum back to `total`.
 * Largest-remainder method: proportional shares are floored, then the leftover
 * minor units go to the entries with the biggest discarded fraction. Without
 * this, an order-level discount spread over three lines loses or invents a
 * kurus and the drawer never balances.
 */
export function allocate(total: number, weights: readonly number[]): number[] {
  if (weights.length === 0) return [];

  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  if (weightSum <= 0) {
    // No basis to weight by: put everything on the first entry.
    return weights.map((_, i) => (i === 0 ? total : 0));
  }

  const exact = weights.map((w) => (total * w) / weightSum);
  const floored = exact.map((v) => Math.floor(v));
  let remainder = total - floored.reduce((sum, v) => sum + v, 0);

  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);

  const result = [...floored];
  for (let k = 0; remainder > 0 && k < order.length; k++, remainder--) {
    result[order[k].i] += 1;
  }
  return result;
}

/** Clamp a value into [min, max]; used to keep discounts from exceeding a line. */
export function clampMinor(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  TRY: "₺",
  AED: "د.إ",
  SAR: "﷼",
};

/**
 * Money for the terminal. Unlike lib/format.ts money(), this always shows the
 * minor units: a cashier counting change needs to see 450,50 and not 451.
 */
const NUMBER_LOCALES: Record<string, string> = {
  TRY: "tr-TR",
  EUR: "de-DE",
};

export function moneyMinor(minor: number, currency = "TRY"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  const sign = minor < 0 ? "-" : "";
  return (
    sign +
    symbol +
    (Math.abs(minor) / 100).toLocaleString(NUMBER_LOCALES[currency] ?? "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
