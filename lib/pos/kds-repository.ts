import { prisma } from "@/lib/prisma";

export type KdsLine = {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  status: string;
  modifiers: string[];
  sentAt: Date | null;
};

export type KdsTicket = {
  orderId: string;
  code: number;
  tableName: string | null;
  channel: string;
  /** Oldest sentAt on the ticket: what the colour coding counts from. */
  since: Date;
  lines: KdsLine[];
};

/** Stations the menu actually routes to, so the screen never offers an empty one. */
export async function getStations(restaurantId: string): Promise<string[]> {
  const rows = await prisma.posCategory.findMany({
    where: { restaurantId, active: true },
    distinct: ["station"],
    select: { station: true },
    orderBy: { station: "asc" },
  });
  return rows.map((row) => row.station);
}

export async function getKdsTickets(
  restaurantId: string,
  station: string | null,
): Promise<KdsTicket[]> {
  const lines = await prisma.posOrderLine.findMany({
    where: {
      status: { in: ["SENT", "PREPARING", "READY"] },
      ...(station ? { station } : {}),
      order: { restaurantId, status: { in: ["OPEN", "SENT", "PARTIALLY_PAID"] } },
    },
    // createdAt breaks the tie: lines fired together share a sentAt, and without
    // it Postgres is free to return an updated row in a new position, so cards
    // reshuffle under the cook's hand every time a line is bumped.
    orderBy: [{ sentAt: "asc" }, { createdAt: "asc" }],
    include: {
      modifiers: { select: { name: true } },
      order: { select: { id: true, code: true, channel: true, openedAt: true, table: { select: { name: true } } } },
    },
  });

  const tickets = new Map<string, KdsTicket>();
  for (const line of lines) {
    const existing = tickets.get(line.order.id);
    const sentAt = line.sentAt ?? line.order.openedAt;
    const ticket: KdsTicket =
      existing ??
      {
        orderId: line.order.id,
        code: line.order.code,
        tableName: line.order.table?.name ?? null,
        channel: line.order.channel,
        since: sentAt,
        lines: [],
      };
    if (sentAt < ticket.since) ticket.since = sentAt;
    ticket.lines.push({
      id: line.id,
      name: line.name,
      quantity: line.quantity,
      note: line.note,
      status: line.status,
      modifiers: line.modifiers.map((m) => m.name),
      sentAt: line.sentAt,
    });
    tickets.set(line.order.id, ticket);
  }

  // Oldest ticket first: the kitchen works the queue, not the screen layout.
  return [...tickets.values()].sort((a, b) => a.since.getTime() - b.since.getTime());
}
