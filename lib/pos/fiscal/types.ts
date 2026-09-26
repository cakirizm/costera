/**
 * The shape of a fiscal device, whoever makes it.
 *
 * Every YN OKC speaks the same protocol family (GMP-3) but ships its own SDK,
 * so the vendor choice decides one implementation of this interface and nothing
 * else. Writing it now means the payment flow, the retry rules and the failure
 * handling can all be built and tested before a device is on the counter.
 */

export type FiscalLine = {
  name: string;
  quantity: number;
  /** Tax-inclusive unit price, in minor units. */
  unitPriceMinor: number;
  totalMinor: number;
  taxRatePct: number;
  /** OKC devices bill per department; this is the one this line belongs to. */
  department: number;
};

export type FiscalPayment = {
  /** CASH and CARD are what every device understands; the rest map per vendor. */
  method: "CASH" | "CARD" | "MEAL_CARD" | "ONLINE" | "ON_ACCOUNT";
  amountMinor: number;
};

export type FiscalReceiptRequest = {
  /** The ticket this receipt is for. Devices echo it back for reconciliation. */
  reference: string;
  currency: string;
  lines: FiscalLine[];
  payments: FiscalPayment[];
  totalMinor: number;
  taxMinor: number;
  discountMinor: number;
};

export type FiscalReceiptResult =
  | {
      ok: true;
      /** What the device printed, and what the tax office will have on file. */
      okcSerial: string;
      zNo: number;
      fiscalNo: string;
      receiptNo: string;
    }
  | {
      ok: false;
      /** Vendor code, kept verbatim so support can look it up. */
      code: string;
      message: string;
      /** True when trying again might work: paper, comms, a busy device. */
      retryable: boolean;
    };

export type FiscalDeviceStatus = {
  online: boolean;
  okcSerial: string | null;
  /** Some devices refuse to sell once the daily Z report is overdue. */
  zReportDue: boolean;
  message?: string;
};

export interface FiscalDevice {
  readonly provider: string;
  printReceipt(request: FiscalReceiptRequest): Promise<FiscalReceiptResult>;
  status(): Promise<FiscalDeviceStatus>;
}
