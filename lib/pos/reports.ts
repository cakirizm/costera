import { prisma } from "@/lib/prisma";
import { businessDayFor } from "./business-day";

/**
 * Day-close numbers for the dashboard.
 *
 * Keyed on businessDay rather than a timestamp window: a ticket opened at 01:30
 * belongs to the evening that is still running, and the report has to agree with
 * what the shift screen told the cashier.
 */

export type PosDaySummary = {
  businessDay: Date;
  ticketCount: number;
  grossMinor: number;
  discountMinor: number;
  averageTicketMinor: number;
  byMethod: { method: string; amountMinor: number; count: number }[];
  byChannel: { channel: string; ticketCount: number; grossMinor: number }[];
  topProducts: { name: string; quantity: number; grossMinor: number }[];
  shifts: {
    id: string;
    status: string;
    openedAt: Date;
    closedAt: Date | null;
    expectedCashMinor: number | null;
    countedCashMinor: number | null;
    differenceMinor: number | null;
  }[];
  voidedLines: number;
  compedLines: number;
};

export async function getPosDaySummary(
  restaurantId: string,
  at = new Date(),
): Promise<PosDaySummary> {
  const businessDay = businessDayFor(at);
  const paidOrders = { restaurantId, businessDay, status: "PAID" as const };

  const [orders, byMethod, lines, shifts, writeOffs] = await Promise.all([
    prisma.posOrder.findMany({
      where: paidOrders,
      select: { id: true, channel: true, totalMinor: true, discountMinor: true },
    }),
    prisma.posPayment.groupBy({
      by: ["method"],
      where: { order: { is: paidOrders } },
      _sum: { amountMinor: true },
      _count: { _all: true },
    }),
    prisma.posOrderLine.groupBy({
      by: ["name"],
      where: { order: { is: paidOrders }, status: { not: "VOID" } },
      _sum: { quantity: true, lineTotalMinor: true },
    }),
    prisma.posShift.findMany({
      where: { restaurantId, openedAt: { gte: businessDay } },
      orderBy: { openedAt: "asc" },
      select: {
        id: true,
        status: true,
        openedAt: true,
        closedAt: true,
        expectedCashMinor: true,
        countedCashMinor: true,
        differenceMinor: true,
      },
    }),
    prisma.posOrderLine.groupBy({
      by: ["status"],
      where: { order: { is: { restaurantId, businessDay } } },
      _count: { _all: true },
    }),
  ]);

  const grossMinor = orders.reduce((sum, order) => sum + order.totalMinor, 0);

  const channels = new Map<string, { channel: string; ticketCount: number; grossMinor: number }>();
  for (const order of orders) {
    const row = channels.get(order.channel) ?? {
      channel: order.channel,
      ticketCount: 0,
      grossMinor: 0,
    };
    row.ticketCount += 1;
    row.grossMinor += order.totalMinor;
    channels.set(order.channel, row);
  }

  const compedLines = await prisma.posOrderLine.count({
    where: { order: { is: { restaurantId, businessDay } }, isComped: true },
  });

  return {
    businessDay,
    ticketCount: orders.length,
    grossMinor,
    discountMinor: orders.reduce((sum, order) => sum + order.discountMinor, 0),
    averageTicketMinor: orders.length > 0 ? Math.round(grossMinor / orders.length) : 0,
    byMethod: byMethod
      .map((row) => ({
        method: row.method,
        amountMinor: row._sum.amountMinor ?? 0,
        count: row._count._all,
      }))
      .sort((a, b) => b.amountMinor - a.amountMinor),
    byChannel: [...channels.values()].sort((a, b) => b.grossMinor - a.grossMinor),
    topProducts: lines
      .map((row) => ({
        name: row.name,
        quantity: row._sum.quantity ?? 0,
        grossMinor: row._sum.lineTotalMinor ?? 0,
      }))
      .sort((a, b) => b.grossMinor - a.grossMinor)
      .slice(0, 8),
    shifts,
    voidedLines: writeOffs.find((row) => row.status === "VOID")?._count._all ?? 0,
    compedLines,
  };
}
