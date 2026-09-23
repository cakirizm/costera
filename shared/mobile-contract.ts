import { z } from "zod";

export const mobileLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});
export const mobileSessionSchema = z.object({
  token: z.string().min(40).max(128),
  expiresAt: z.string().datetime(),
  user: z.object({ id: z.string(), name: z.string().nullable(), email: z.string() }),
});
export const restaurantsSchema = z.object({
  restaurants: z.array(z.object({
    id: z.string(), name: z.string(), city: z.string().nullable(), role: z.string(),
    locations: z.array(z.object({ id: z.string(), name: z.string() })),
  })),
});
const amount = z.number().finite();
export const overviewSchema = z.object({
  restaurantId: z.string(), locationId: z.string().nullable(),
  generatedAt: z.string().datetime(),
  period: z.object({ from: z.string(), to: z.string() }).nullable(),
  // No currency setting exists in the web model yet. Keep the web's USD convention explicit.
  currency: z.literal("USD"),
  source: z.object({
    kind: z.enum(["DEMO", "IMPORT", "POS_API"]), provider: z.string(), syncedAt: z.string().datetime(),
    state: z.enum(["demo", "imported", "recent", "stale"]),
  }).nullable(),
  scope: z.enum(["restaurant", "branch-sales-only"]),
  kpis: z.object({
    netSales: amount, unitsSold: amount, theoreticalCost: amount,
    targetFoodCostPct: amount, actualFoodCostPct: amount.nullable(),
    unexplainedCost: amount.nullable(), operatingExpenses: amount.nullable(), netProfit: amount.nullable(),
  }).nullable(),
  channels: z.array(z.object({ name: z.string(), sales: amount })),
  alerts: z.array(z.object({
    id: z.string(), kind: z.enum(["variance", "missing-menu", "missing-ingredient", "above-target"]),
    severity: z.enum(["high", "medium"]), subject: z.string(), value: amount.nullable(),
  })),
});
export type MobileSession = z.infer<typeof mobileSessionSchema>;
export type MobileRestaurant = z.infer<typeof restaurantsSchema>["restaurants"][number];
export type MobileOverview = z.infer<typeof overviewSchema>;
