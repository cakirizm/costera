import { isSupported, run, SNAPSHOT_STORE } from "./db";

/**
 * Last-known state, kept so a reload during an outage does not lose the table.
 *
 * Only what a waiter needs to keep taking an order: the ticket as the server
 * last described it, and the menu to add from. No totals are recomputed here -
 * the offline screen shows what the server last said plus what is queued, and
 * says so, rather than pretending to price a ticket the server has not seen.
 */

export type CachedLine = {
  id: string;
  name: string;
  quantity: number;
  lineTotalMinor: number;
  status: string;
};

export type CachedOrder = {
  id: string;
  code: number;
  status: string;
  totalMinor: number;
  lines: CachedLine[];
  cachedAt: number;
};

export type CachedProduct = {
  id: string;
  name: string;
  priceMinor: number;
  hasOptions: boolean;
};

export type CachedMenu = {
  currency: string;
  categories: { id: string; name: string; products: CachedProduct[] }[];
  cachedAt: number;
};

const MENU_KEY = "menu";
const orderKey = (orderId: string) => `order:${orderId}`;

type Record_ = { key: string; value: unknown };

async function put(key: string, value: unknown): Promise<void> {
  if (!isSupported()) return;
  try {
    await run(SNAPSHOT_STORE, "readwrite", (store) => store.put({ key, value }));
  } catch {
    // A private window can refuse storage. The terminal still works online, and
    // a cold start simply will not have anything to show.
  }
}

async function get<T>(key: string): Promise<T | null> {
  if (!isSupported()) return null;
  try {
    const row = await run<Record_ | undefined>(SNAPSHOT_STORE, "readonly", (store) => store.get(key));
    return (row?.value as T) ?? null;
  } catch {
    return null;
  }
}

export function cacheOrder(order: Omit<CachedOrder, "cachedAt">): Promise<void> {
  return put(orderKey(order.id), { ...order, cachedAt: Date.now() });
}

export function readCachedOrder(orderId: string): Promise<CachedOrder | null> {
  return get<CachedOrder>(orderKey(orderId));
}

export function cacheMenu(menu: Omit<CachedMenu, "cachedAt">): Promise<void> {
  return put(MENU_KEY, { ...menu, cachedAt: Date.now() });
}

export function readCachedMenu(): Promise<CachedMenu | null> {
  return get<CachedMenu>(MENU_KEY);
}

/** The ticket id out of /pos/order/<id>, which is the URL the app is left on. */
export function orderIdFromPath(pathname: string): string | null {
  const match = /^\/pos\/order\/([^/]+)/.exec(pathname);
  return match?.[1] ?? null;
}

/**
 * The ticket the terminal was last on.
 *
 * Used when the offline screen is reached from a URL with no ticket in it -
 * the floor plan, say. Showing the table the waiter was actually working is
 * more use than telling them nothing was saved.
 */
export async function readMostRecentOrder(): Promise<CachedOrder | null> {
  if (!isSupported()) return null;
  try {
    const rows = await run<Record_[]>(SNAPSHOT_STORE, "readonly", (store) => store.getAll());
    const orders = rows
      .filter((row) => row.key.startsWith("order:"))
      .map((row) => row.value as CachedOrder)
      .sort((a, b) => b.cachedAt - a.cachedAt);
    return orders[0] ?? null;
  } catch {
    return null;
  }
}
