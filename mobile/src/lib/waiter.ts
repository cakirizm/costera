import { api } from "./api";

/**
 * Waiter handheld client.
 *
 * Types are declared here rather than imported from the repo's shared contract,
 * matching how api.ts already works: the Expo bundler has no path into the web
 * package, and wiring one in for a handful of shapes is not worth the build
 * complexity. The server validates every payload anyway.
 */

export type WaiterStaff = { membershipId: string; name: string; role: string };
export type WaiterVenue = { id: string; name: string; currency: string };
export type WaiterDevice = { id: string; name: string };

export type WaiterSession = {
  token: string;
  expiresAt: string;
  staff: WaiterStaff;
  venue: WaiterVenue;
  device: WaiterDevice;
};

export type WaiterModifier = { id: string; name: string; priceMinor: number };

export type WaiterProduct = {
  id: string;
  name: string;
  priceMinor: number;
  isMapped: boolean;
  modifierGroups: {
    id: string;
    name: string;
    required: boolean;
    maxSelect: number;
    modifiers: WaiterModifier[];
  }[];
};

export type WaiterCategory = { id: string; name: string; products: WaiterProduct[] };

export type WaiterTable = {
  id: string;
  name: string;
  seats: number;
  order: { id: string; code: number; totalMinor: number; openedAt: string } | null;
};

export type WaiterArea = { id: string; name: string; tables: WaiterTable[] };

export type WaiterBootstrap = {
  staff: WaiterStaff;
  venue: WaiterVenue;
  device: WaiterDevice;
  areas: WaiterArea[];
  categories: WaiterCategory[];
};

export type WaiterOrderLine = {
  id: string;
  name: string;
  quantity: number;
  lineTotalMinor: number;
  status: string;
  note: string | null;
  modifiers: string[];
};

export type WaiterOrder = {
  id: string;
  code: number;
  status: string;
  tableName: string | null;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  lines: WaiterOrderLine[];
};

const SYMBOLS: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£" };

/** Always two decimals: a waiter reads the same figure the till will charge. */
export function money(minor: number, currency = "TRY"): string {
  const symbol = SYMBOLS[currency] ?? currency + " ";
  const sign = minor < 0 ? "-" : "";
  return `${sign}${symbol}${(Math.abs(minor) / 100).toFixed(2)}`;
}

/** Enough entropy to be unique per tap without pulling in a uuid dependency. */
export function clientId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 12);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function signIn(deviceToken: string, pin: string) {
  return api<WaiterSession>("/api/pos/handheld/session", { body: { deviceToken, pin } });
}

export function signOut(token: string) {
  return api<{ ok: true }>("/api/pos/handheld/session", { method: "DELETE", token });
}

export function bootstrap(token: string) {
  return api<WaiterBootstrap>("/api/pos/handheld/bootstrap", { token });
}

export function openOrder(token: string, tableId: string | null) {
  return api<WaiterOrder>("/api/pos/handheld/orders", {
    body: { clientOrderId: clientId("ord"), tableId },
    token,
  });
}

export function getOrder(token: string, orderId: string) {
  return api<WaiterOrder>(`/api/pos/handheld/orders/${orderId}`, { token });
}

export type NewLine = {
  productId: string;
  clientLineId: string;
  quantity: number;
  note?: string | null;
  modifierIds?: string[];
};

export function addLines(token: string, orderId: string, items: NewLine[]) {
  return api<WaiterOrder>(`/api/pos/handheld/orders/${orderId}/lines`, {
    body: { items },
    token,
  });
}

export function sendToKitchen(token: string, orderId: string) {
  return api<WaiterOrder>(`/api/pos/handheld/orders/${orderId}/send`, { method: "POST", token });
}
