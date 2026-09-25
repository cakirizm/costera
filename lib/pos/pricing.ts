import { allocate, clampMinor, roundMinor } from "./money";

/**
 * Pure order pricing. No Prisma, no session, no I/O - so it can be tested
 * exhaustively, which is the point: this is the only place in COSTERA where a
 * rounding mistake turns into a cash-drawer discrepancy.
 *
 * Tax model: Turkish menu prices are VAT-inclusive (KDV dahil). The tax shown
 * on a ticket is therefore *extracted* from the gross amount, never added on
 * top. The OKC device is billed the same way, per tax department.
 */

export type ModifierInput = {
  priceMinor: number;
  quantity?: number;
};

export type LineInput = {
  quantity: number;
  unitPriceMinor: number;
  taxRatePct: number;
  modifiers?: readonly ModifierInput[];
  /** Absolute discount on this line, in minor units. Clamped to the line gross. */
  discountMinor?: number;
  /** A comped line is served but charged at zero; it still appears on the ticket. */
  isComped?: boolean;
  isVoid?: boolean;
};

export type PricedLine = {
  quantity: number;
  unitPriceMinor: number;
  modifiersMinor: number;
  grossMinor: number;
  discountMinor: number;
  lineTotalMinor: number;
  taxRatePct: number;
  taxMinor: number;
  isComped: boolean;
  isVoid: boolean;
};

export type TaxBucket = {
  taxRatePct: number;
  baseMinor: number;
  taxMinor: number;
};

export type OrderInput = {
  lines: readonly LineInput[];
  /** Absolute discount on the whole order, spread across lines proportionally. */
  orderDiscountMinor?: number;
  /** Service charge percentage applied after discounts. */
  servicePct?: number;
  /** Tax rate carried by the service charge line. */
  serviceTaxRatePct?: number;
};

export type PricedOrder = {
  lines: PricedLine[];
  subtotalMinor: number;
  discountMinor: number;
  serviceMinor: number;
  taxMinor: number;
  totalMinor: number;
  taxBreakdown: TaxBucket[];
};

/** VAT contained in a tax-inclusive gross amount. */
export function taxFromInclusive(grossMinor: number, taxRatePct: number): number {
  if (taxRatePct <= 0) return 0;
  return roundMinor((grossMinor * taxRatePct) / (100 + taxRatePct));
}

function modifiersPerUnit(modifiers: readonly ModifierInput[] | undefined): number {
  if (!modifiers?.length) return 0;
  return modifiers.reduce((sum, m) => sum + m.priceMinor * (m.quantity ?? 1), 0);
}

export function priceLine(line: LineInput): PricedLine {
  const quantity = Math.max(0, Math.trunc(line.quantity));
  const perUnitModifiers = modifiersPerUnit(line.modifiers);
  const modifiersMinor = quantity * perUnitModifiers;
  const grossMinor = quantity * (line.unitPriceMinor + perUnitModifiers);

  const isVoid = line.isVoid === true;
  const isComped = line.isComped === true;

  // A void line contributes nothing at all; a comped line contributes its gross
  // as a discount so the ticket still shows what was given away.
  const discountMinor = isVoid
    ? 0
    : isComped
      ? grossMinor
      : clampMinor(roundMinor(line.discountMinor ?? 0), 0, grossMinor);

  const lineTotalMinor = isVoid ? 0 : grossMinor - discountMinor;

  return {
    quantity,
    unitPriceMinor: line.unitPriceMinor,
    modifiersMinor,
    grossMinor: isVoid ? 0 : grossMinor,
    discountMinor,
    lineTotalMinor,
    taxRatePct: line.taxRatePct,
    taxMinor: taxFromInclusive(lineTotalMinor, line.taxRatePct),
    isComped,
    isVoid,
  };
}

export function priceOrder(input: OrderInput): PricedOrder {
  const lines = input.lines.map(priceLine);

  const chargeable = lines.filter((l) => !l.isVoid);
  const afterLineDiscount = chargeable.reduce((sum, l) => sum + l.lineTotalMinor, 0);

  // Spread the order-level discount over the lines so every ticket line carries
  // its own share; the parts are guaranteed to sum back to the discount.
  const requestedOrderDiscount = clampMinor(
    roundMinor(input.orderDiscountMinor ?? 0),
    0,
    afterLineDiscount,
  );
  const shares = allocate(
    requestedOrderDiscount,
    chargeable.map((l) => l.lineTotalMinor),
  );

  chargeable.forEach((line, i) => {
    const share = shares[i] ?? 0;
    if (share === 0) return;
    line.discountMinor += share;
    line.lineTotalMinor -= share;
    line.taxMinor = taxFromInclusive(line.lineTotalMinor, line.taxRatePct);
  });

  const netMinor = chargeable.reduce((sum, l) => sum + l.lineTotalMinor, 0);

  const servicePct = input.servicePct ?? 0;
  const serviceMinor = servicePct > 0 ? roundMinor((netMinor * servicePct) / 100) : 0;
  const serviceTaxRatePct = input.serviceTaxRatePct ?? 10;
  const serviceTaxMinor = taxFromInclusive(serviceMinor, serviceTaxRatePct);

  const buckets = new Map<number, TaxBucket>();
  const addToBucket = (ratePct: number, baseMinor: number, taxMinor: number) => {
    if (baseMinor === 0 && taxMinor === 0) return;
    const bucket = buckets.get(ratePct) ?? { taxRatePct: ratePct, baseMinor: 0, taxMinor: 0 };
    bucket.baseMinor += baseMinor;
    bucket.taxMinor += taxMinor;
    buckets.set(ratePct, bucket);
  };
  for (const line of chargeable) addToBucket(line.taxRatePct, line.lineTotalMinor, line.taxMinor);
  addToBucket(serviceTaxRatePct, serviceMinor, serviceTaxMinor);

  return {
    lines,
    subtotalMinor: chargeable.reduce((sum, l) => sum + l.grossMinor, 0),
    discountMinor: chargeable.reduce((sum, l) => sum + l.discountMinor, 0),
    serviceMinor,
    taxMinor: chargeable.reduce((sum, l) => sum + l.taxMinor, 0) + serviceTaxMinor,
    totalMinor: netMinor + serviceMinor,
    taxBreakdown: [...buckets.values()].sort((a, b) => a.taxRatePct - b.taxRatePct),
  };
}

/** What is still owed on an order after the payments taken so far. */
export function remainingDue(totalMinor: number, paidMinor: number): number {
  return Math.max(0, totalMinor - paidMinor);
}

/** Change owed to the guest for a cash tender. Never negative. */
export function changeFor(tenderedMinor: number, dueMinor: number): number {
  return Math.max(0, tenderedMinor - dueMinor);
}
