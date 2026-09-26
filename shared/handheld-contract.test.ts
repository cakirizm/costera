import { describe, expect, it } from "vitest";
import {
  addLinesSchema,
  enrolSchema,
  handheldSignInSchema,
  openOrderSchema,
} from "./handheld-contract";

describe("enrolment", () => {
  it("accepts a device token of the length the server issues", () => {
    expect(enrolSchema.safeParse({ deviceToken: "a".repeat(43) }).success).toBe(true);
  });

  it("rejects something far too short to be a token", () => {
    expect(enrolSchema.safeParse({ deviceToken: "abc" }).success).toBe(false);
  });
});

describe("PIN", () => {
  it("accepts four to six digits", () => {
    for (const pin of ["1234", "12345", "123456"]) {
      expect(handheldSignInSchema.safeParse({ pin }).success, pin).toBe(true);
    }
  });

  it("rejects anything that is not digits, or the wrong length", () => {
    for (const pin of ["123", "1234567", "12a4", "", "  12"]) {
      expect(handheldSignInSchema.safeParse({ pin }).success, JSON.stringify(pin)).toBe(false);
    }
  });
});

describe("opening an order", () => {
  it("requires a client id long enough to be unique", () => {
    expect(openOrderSchema.safeParse({ clientOrderId: "ord-12345678", tableId: null }).success).toBe(true);
    expect(openOrderSchema.safeParse({ clientOrderId: "short", tableId: null }).success).toBe(false);
  });

  it("allows a ticket with no table, for takeaway", () => {
    expect(openOrderSchema.safeParse({ clientOrderId: "ord-12345678", tableId: null }).success).toBe(true);
  });
});

describe("adding lines", () => {
  const line = { productId: "p1", clientLineId: "line-12345678", quantity: 1 };

  it("insists on an idempotency key for every line", () => {
    expect(addLinesSchema.safeParse({ items: [line] }).success).toBe(true);
    const { clientLineId: _omitted, ...withoutKey } = line;
    expect(addLinesSchema.safeParse({ items: [withoutKey] }).success).toBe(false);
  });

  it("rejects an empty or absurd batch", () => {
    expect(addLinesSchema.safeParse({ items: [] }).success).toBe(false);
    expect(addLinesSchema.safeParse({ items: Array(51).fill(line) }).success).toBe(false);
  });

  it("rejects a quantity a waiter could not have meant", () => {
    expect(addLinesSchema.safeParse({ items: [{ ...line, quantity: 0 }] }).success).toBe(false);
    expect(addLinesSchema.safeParse({ items: [{ ...line, quantity: 1.5 }] }).success).toBe(false);
    expect(addLinesSchema.safeParse({ items: [{ ...line, quantity: 100 }] }).success).toBe(false);
  });
});
