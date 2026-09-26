/**
 * Offline outbox for the terminal.
 *
 * Browser-only: IndexedDB keeps the waiter's taps while the network is down and
 * replays them in order once it returns. Every entry carries the idempotency key
 * the server deduplicates on, so a replay after a half-delivered request adds
 * nothing twice.
 *
 * Deliberately narrow. Only adding lines to a ticket that already exists is
 * queued. Payments, voids, comps and discounts are never queued - they move
 * money or need a manager present, and a fiscal receipt cannot be issued from a
 * queue. Opening a ticket is not queued either: the server assigns the ticket
 * number and id, so there would be nothing for the waiter to open.
 */

import { OUTBOX_STORE, run } from "./db";

export type OutboxEntry = {
  id: string;
  kind: "ADD_LINES";
  createdAt: number;
  payload: {
    orderId: string;
    items: {
      productId: string;
      quantity: number;
      clientLineId: string;
      modifierIds?: string[];
    }[];
  };
};

export type NewOutboxEntry = Omit<OutboxEntry, "createdAt">;

export async function enqueue(entry: NewOutboxEntry, now = Date.now()): Promise<void> {
  await run(OUTBOX_STORE, "readwrite", (store) => store.put({ ...entry, createdAt: now }));
}

export async function listQueue(): Promise<OutboxEntry[]> {
  const entries = await run<OutboxEntry[]>(
    OUTBOX_STORE,
    "readonly",
    (store) => store.getAll() as IDBRequest<OutboxEntry[]>,
  );
  // Replay in the order the waiter tapped: a line added to a ticket must not
  // reach the server before the ticket exists.
  return entries.sort((a, b) => a.createdAt - b.createdAt);
}

export async function remove(id: string): Promise<void> {
  await run(OUTBOX_STORE, "readwrite", (store) => store.delete(id));
}

export async function queueSize(): Promise<number> {
  return run<number>(OUTBOX_STORE, "readonly", (store) => store.count());
}

export { isSupported } from "./db";
