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

const DB_NAME = "costera-pos";
const DB_VERSION = 1;
const STORE = "outbox";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = work(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      }),
  );
}

export type NewOutboxEntry = Omit<OutboxEntry, "createdAt">;

export async function enqueue(entry: NewOutboxEntry, now = Date.now()): Promise<void> {
  await run("readwrite", (store) => store.put({ ...entry, createdAt: now }));
}

export async function listQueue(): Promise<OutboxEntry[]> {
  const entries = await run<OutboxEntry[]>(
    "readonly",
    (store) => store.getAll() as IDBRequest<OutboxEntry[]>,
  );
  // Replay in the order the waiter tapped: a line added to a ticket must not
  // reach the server before the ticket exists.
  return entries.sort((a, b) => a.createdAt - b.createdAt);
}

export async function remove(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id));
}

export async function queueSize(): Promise<number> {
  return run<number>("readonly", (store) => store.count());
}

export function isSupported(): boolean {
  return typeof indexedDB !== "undefined";
}
