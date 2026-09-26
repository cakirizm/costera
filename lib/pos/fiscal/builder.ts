import { priceOrder } from "../pricing";
import type { FiscalLine, FiscalPayment, FiscalReceiptRequest } from "./types";

/**
 * Turns a settled ticket into what the device needs to print.
 *
 * Pure, and the only place the two models meet: the POS thinks in products and
 * modifiers, the OKC thinks in lines and tax departments. Getting this wrong
 * does not produce a bug report, it produces a wrong tax return, so it is
 * separated from everything that touches a database and tested on its own.
 */

export type BuilderLine = {
  name: string;
  quantity: number;
  unitPriceMinor: number;
  modifiersMinor: number;
  discountMinor: number;
  taxRatePct: number;
  isComped: boolean;
  isVoid: boolean;
  department: number | null;
};

export type BuilderInput = {
  reference: string;
  currency: string;
  orderDiscountMinor: number;
  lines: BuilderLine[];
  payments: { method: FiscalPayment["method"]; amountMinor: number }[];
};

/** Where a line lands when its tax group names no department. */
export const DEFAULT_DEPARTMENT = 1;

export function buildReceiptRequest(input: BuilderInput): FiscalReceiptRequest {
  // Reprice from the same function the ticket was totalled with, so the receipt
  // can never disagree with what the guest was charged.
  const priced = priceOrder({
    lines: input.lines.map((line) => ({
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor + line.modifiersMinor,
      taxRatePct: line.taxRatePct,
      discountMinor: line.discountMinor,
      isComped: line.isComped,
      isVoid: line.isVoid,
    })),
    orderDiscountMinor: input.orderDiscountMinor,
  });

  const lines: FiscalLine[] = [];
  input.lines.forEach((line, index) => {
    const pricedLine = priced.lines[index];
    // A void never happened and a comp was given away: neither is a sale, and
    // printing them would overstate the takings on the fiscal record.
    if (pricedLine.isVoid || pricedLine.lineTotalMinor === 0) return;

    lines.push({
      name: line.name,
      quantity: pricedLine.quantity,
      unitPriceMinor: Math.round(pricedLine.lineTotalMinor / Math.max(1, pricedLine.quantity)),
      totalMinor: pricedLine.lineTotalMinor,
      taxRatePct: line.taxRatePct,
      department: line.department ?? DEFAULT_DEPARTMENT,
    });
  });

  return {
    reference: input.reference,
    currency: input.currency,
    lines,
    payments: input.payments.filter((payment) => payment.amountMinor > 0),
    totalMinor: priced.totalMinor,
    taxMinor: priced.taxMinor,
    discountMinor: priced.discountMinor,
  };
}

/**
 * The device must be handed exactly what was collected. A mismatch here means
 * the drawer and the fiscal record disagree, which is the one thing an
 * inspection will find.
 */
export function paymentsBalance(request: FiscalReceiptRequest): boolean {
  const paid = request.payments.reduce((sum, payment) => sum + payment.amountMinor, 0);
  return paid === request.totalMinor;
}
