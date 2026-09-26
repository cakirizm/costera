import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { OrderWithLines } from "../order-service";
import { buildReceiptRequest, type BuilderLine } from "./builder";
import { sharedSimulator } from "./simulator";
import type { FiscalDevice, FiscalReceiptResult } from "./types";

/**
 * Issuing the legal receipt.
 *
 * The device is called outside any database transaction on purpose: it is a
 * piece of hardware on the far side of a cable, and holding row locks while it
 * thinks would stall every other till in the venue.
 *
 * The record is written before the device is asked and updated after, so a
 * process that dies mid-print leaves a QUEUED row someone can see and retry -
 * never a ticket that was printed but not recorded.
 */

export function resolveDevice(provider: string | null): FiscalDevice | null {
  if (!provider) return null;
  if (provider === "simulator") return sharedSimulator();
  // A vendor name with no adapter compiled in is a misconfiguration, not a
  // reason to close tickets without a receipt.
  return null;
}

export type IssueResult =
  | { ok: true; receiptId: string; fiscalNo: string }
  | { ok: false; receiptId: string | null; code: string; message: string; retryable: boolean };

function toBuilderLines(order: OrderWithLines, departments: Map<string, number | null>): BuilderLine[] {
  return order.lines.map((line) => ({
    name: line.name,
    quantity: line.quantity,
    unitPriceMinor: line.unitPriceMinor,
    modifiersMinor: line.modifiersMinor,
    discountMinor: line.discountMinor,
    taxRatePct: line.taxRatePct,
    isComped: line.isComped,
    isVoid: line.status === "VOID",
    department: (line.productId ? departments.get(line.productId) : null) ?? null,
  }));
}

/**
 * Print the receipt for a settled ticket, reusing an unfinished attempt if one
 * is already on file. Retrying must never produce a second fiscal document for
 * the same ticket.
 */
export async function issueFiscalReceipt(
  order: OrderWithLines,
  provider: string,
  now = new Date(),
): Promise<IssueResult> {
  const device = resolveDevice(provider);
  if (!device) {
    return {
      ok: false,
      receiptId: null,
      code: "NO_ADAPTER",
      message: `No fiscal adapter is compiled in for "${provider}".`,
      retryable: false,
    };
  }

  const confirmed = await prisma.fiscalReceipt.findFirst({
    where: { orderId: order.id, status: "CONFIRMED" },
  });
  if (confirmed) {
    return { ok: true, receiptId: confirmed.id, fiscalNo: confirmed.fiscalNo ?? "" };
  }

  const [products, payments] = await Promise.all([
    prisma.posProduct.findMany({
      where: { restaurantId: order.restaurantId },
      select: { id: true, taxGroup: { select: { okcDepartment: true } } },
    }),
    prisma.posPayment.findMany({
      where: { orderId: order.id },
      select: { method: true, amountMinor: true },
    }),
  ]);

  const departments = new Map(products.map((p) => [p.id, p.taxGroup?.okcDepartment ?? null]));
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: order.restaurantId },
    select: { currency: true },
  });

  const request = buildReceiptRequest({
    reference: order.id,
    currency: restaurant?.currency ?? "TRY",
    orderDiscountMinor: order.orderDiscountMinor,
    lines: toBuilderLines(order, departments),
    payments: payments.map((p) => ({ method: p.method, amountMinor: p.amountMinor })),
  });

  const existing = await prisma.fiscalReceipt.findFirst({
    where: { orderId: order.id, status: { in: ["QUEUED", "FAILED"] } },
    orderBy: { createdAt: "desc" },
  });

  const receipt = existing
    ? await prisma.fiscalReceipt.update({
        where: { id: existing.id },
        data: {
          status: "SENT",
          provider,
          attempts: { increment: 1 },
          requestPayload: request as unknown as Prisma.InputJsonValue,
          sentAt: now,
        },
      })
    : await prisma.fiscalReceipt.create({
        data: {
          restaurantId: order.restaurantId,
          orderId: order.id,
          provider,
          status: "SENT",
          attempts: 1,
          requestPayload: request as unknown as Prisma.InputJsonValue,
          sentAt: now,
        },
      });

  let result: FiscalReceiptResult;
  try {
    result = await device.printReceipt(request);
  } catch (error) {
    result = {
      ok: false,
      code: "ADAPTER_THREW",
      message: error instanceof Error ? error.message : String(error),
      retryable: true,
    };
  }

  if (!result.ok) {
    await prisma.fiscalReceipt.update({
      where: { id: receipt.id },
      data: { status: "FAILED", errorCode: result.code, errorMessage: result.message.slice(0, 500) },
    });
    return {
      ok: false,
      receiptId: receipt.id,
      code: result.code,
      message: result.message,
      retryable: result.retryable,
    };
  }

  await prisma.fiscalReceipt.update({
    where: { id: receipt.id },
    data: {
      status: "CONFIRMED",
      okcSerial: result.okcSerial,
      zNo: result.zNo,
      fiscalNo: result.fiscalNo,
      receiptNo: result.receiptNo,
      responsePayload: result as unknown as Prisma.InputJsonValue,
      confirmedAt: now,
      errorCode: null,
      errorMessage: null,
    },
  });

  return { ok: true, receiptId: receipt.id, fiscalNo: result.fiscalNo };
}
