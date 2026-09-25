/**
 * Coded failures from the POS domain. The service layer throws; the server
 * action layer turns the code into a localised message, mirroring how
 * requireRole throws UNAUTHORIZED / FORBIDDEN elsewhere in COSTERA.
 */
export type PosErrorCode =
  | "ORDER_NOT_FOUND"
  | "ORDER_CLOSED"
  | "LINE_NOT_FOUND"
  | "TABLE_NOT_FOUND"
  | "TABLE_BUSY"
  | "PRODUCT_NOT_FOUND"
  | "MODIFIER_NOT_FOUND"
  | "SHIFT_NOT_OPEN"
  | "SHIFT_ALREADY_OPEN"
  | "PAYMENT_EXCEEDS_DUE"
  | "ORDER_UNPAID"
  | "NOTHING_TO_SEND"
  | "INVALID_INPUT";

export class PosError extends Error {
  constructor(
    readonly code: PosErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "PosError";
  }
}

export function isPosError(error: unknown): error is PosError {
  return error instanceof PosError;
}
