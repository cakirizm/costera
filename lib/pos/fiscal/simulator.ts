import type {
  FiscalDevice,
  FiscalDeviceStatus,
  FiscalReceiptRequest,
  FiscalReceiptResult,
} from "./types";
import { paymentsBalance } from "./builder";

/**
 * A fiscal device that exists only in memory.
 *
 * Not a stub that always says yes: it refuses the things a real OKC refuses -
 * an unbalanced tender, an empty receipt, a device with the Z report overdue -
 * and it can be told to fail on command. That is what makes it useful: the
 * retry path, the "ticket stays open until the receipt confirms" rule and the
 * cashier's error message can all be exercised before any hardware is bought.
 *
 * Numbering imitates the real thing closely enough to be reconciled against:
 * receipts increment within a Z, Z increments when the day is closed.
 */
export class SimulatorDevice implements FiscalDevice {
  readonly provider = "simulator";

  private zNo: number;
  private receiptNo: number;
  private failures: FiscalReceiptResult | null = null;
  private offline = false;

  constructor(
    readonly okcSerial = "SIM00000001",
    startZ = 1,
  ) {
    this.zNo = startZ;
    this.receiptNo = 0;
  }

  /** Make the next print fail, the way a jam or a dropped cable would. */
  failNext(result: FiscalReceiptResult) {
    this.failures = result;
  }

  setOffline(offline: boolean) {
    this.offline = offline;
  }

  /** Close the day: receipts restart and the Z counter moves on. */
  closeDay() {
    this.zNo += 1;
    this.receiptNo = 0;
  }

  async status(): Promise<FiscalDeviceStatus> {
    return {
      online: !this.offline,
      okcSerial: this.offline ? null : this.okcSerial,
      zReportDue: this.receiptNo > 500,
    };
  }

  async printReceipt(request: FiscalReceiptRequest): Promise<FiscalReceiptResult> {
    if (this.failures) {
      const queued = this.failures;
      this.failures = null;
      return queued;
    }

    if (this.offline) {
      return { ok: false, code: "SIM_OFFLINE", message: "Device is not reachable.", retryable: true };
    }

    // A real device rejects these outright, and finding that out in production
    // means a queue of customers watching a cashier who cannot close a ticket.
    if (request.lines.length === 0) {
      return { ok: false, code: "SIM_EMPTY", message: "Receipt has no lines.", retryable: false };
    }
    if (!paymentsBalance(request)) {
      return {
        ok: false,
        code: "SIM_UNBALANCED",
        message: "Payments do not add up to the receipt total.",
        retryable: false,
      };
    }

    this.receiptNo += 1;
    return {
      ok: true,
      okcSerial: this.okcSerial,
      zNo: this.zNo,
      fiscalNo: `${this.okcSerial}-${String(this.zNo).padStart(4, "0")}-${String(this.receiptNo).padStart(6, "0")}`,
      receiptNo: String(this.receiptNo).padStart(6, "0"),
    };
  }
}

/** One simulator per process is enough; its counters should survive requests. */
let shared: SimulatorDevice | null = null;

export function sharedSimulator(): SimulatorDevice {
  if (!shared) shared = new SimulatorDevice();
  return shared;
}
