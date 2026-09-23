import Constants from "expo-constants";

const BASE =
  Constants.expoConfig?.extra?.apiUrl ??
  (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000");

type FetchOpts = { method?: string; body?: unknown; token?: string | null };

export async function api<T>(path: string, opts: FetchOpts = {}): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const json = await res.json().catch(() => ({ error: "PARSE_ERROR" }));
  if (!res.ok) return { ok: false, error: json.error ?? "UNKNOWN", status: res.status };
  return { ok: true, data: json as T };
}

export type MobileSession = {
  token: string;
  expiresAt: string;
  user: { id: string; name: string | null; email: string };
};

export type MobileRestaurant = {
  id: string;
  name: string;
  city: string | null;
  role: string;
  locations: { id: string; name: string }[];
};

export type MobileOverview = {
  restaurantId: string;
  locationId: string | null;
  generatedAt: string;
  period: { from: string; to: string } | null;
  currency: string;
  source: {
    kind: string;
    provider: string;
    syncedAt: string;
    state: "demo" | "imported" | "recent" | "stale";
  } | null;
  scope: string;
  kpis: {
    netSales: number;
    unitsSold: number;
    theoreticalCost: number;
    targetFoodCostPct: number;
    actualFoodCostPct: number | null;
    unexplainedCost: number | null;
    operatingExpenses: number | null;
    netProfit: number | null;
  } | null;
  channels: { name: string; sales: number }[];
  alerts: {
    id: string;
    kind: string;
    severity: "high" | "medium";
    subject: string;
    value: number | null;
  }[];
};

export const login = (email: string, password: string) =>
  api<MobileSession>("/api/mobile/auth/login", { body: { email, password } });

export const logout = (token: string) =>
  api<{ ok: true }>("/api/mobile/auth/logout", { method: "POST", token });

export const getRestaurants = (token: string) =>
  api<{ restaurants: MobileRestaurant[] }>("/api/mobile/restaurants", { token });

export const getOverview = (token: string, restaurantId: string, locationId?: string | null) => {
  const params = new URLSearchParams({ restaurantId });
  if (locationId) params.set("locationId", locationId);
  return api<MobileOverview>(`/api/mobile/overview?${params}`, { token });
};
