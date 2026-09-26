import { NextResponse } from "next/server";
import type { HandheldError } from "@/shared/handheld-contract";
import { isPosError } from "./errors";

/**
 * One shape for every handheld response, so the app has a single thing to parse.
 * Domain errors are mapped to the contract's vocabulary; anything unrecognised
 * becomes SERVER_ERROR rather than leaking an internal message to a phone.
 */

const STATUS: Partial<Record<HandheldError, number>> = {
  UNAUTHORIZED: 401,
  DEVICE_UNKNOWN: 401,
  PIN_REJECTED: 401,
  NOT_A_WAITER: 403,
  TOO_MANY_ATTEMPTS: 429,
  INVALID_REQUEST: 400,
  ORDER_NOT_FOUND: 404,
  TABLE_NOT_FOUND: 404,
  PRODUCT_NOT_FOUND: 404,
  ORDER_CLOSED: 409,
  TABLE_BUSY: 409,
  NOTHING_TO_SEND: 409,
  SERVER_ERROR: 500,
};

export function handheldError(error: HandheldError): NextResponse {
  return NextResponse.json({ error }, { status: STATUS[error] ?? 400 });
}

const DOMAIN_TO_WIRE: Record<string, HandheldError> = {
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  ORDER_CLOSED: "ORDER_CLOSED",
  LINE_NOT_FOUND: "ORDER_NOT_FOUND",
  TABLE_NOT_FOUND: "TABLE_NOT_FOUND",
  TABLE_BUSY: "TABLE_BUSY",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  MODIFIER_NOT_FOUND: "PRODUCT_NOT_FOUND",
  NOTHING_TO_SEND: "NOTHING_TO_SEND",
  INVALID_INPUT: "INVALID_REQUEST",
};

export async function handheldHandler(work: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await work();
  } catch (error) {
    if (isPosError(error)) {
      return handheldError(DOMAIN_TO_WIRE[error.code] ?? "INVALID_REQUEST");
    }
    return handheldError("SERVER_ERROR");
  }
}
