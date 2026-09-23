// Tests for shared/mobile-contract.ts Zod schemas
// Importers: vitest runner via `npm test`
// Callers: mobileLoginSchema is used by lib/credentials.ts and app/api/mobile/auth/login/route.ts;
//   overviewSchema validates API response in mobile app; restaurantsSchema validates /api/mobile/restaurants
// Affected API: mobile auth + overview + restaurants endpoints
// Data schemas: mobileLoginSchema, mobileSessionSchema, restaurantsSchema, overviewSchema (all Zod)
// User instruction: "faz 7yi tamamla" — Zod şema validasyon testleri planın parçası, kullanıcı "evet" ile onayladı
import { describe, it, expect } from "vitest";
import {
  mobileLoginSchema,
  mobileSessionSchema,
  restaurantsSchema,
  overviewSchema,
} from "./mobile-contract";

describe("mobileLoginSchema", () => {
  it("accepts valid email + password", () => {
    const result = mobileLoginSchema.safeParse({ email: "A@B.com", password: "secret" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("a@b.com");
    }
  });

  it("rejects missing password", () => {
    expect(mobileLoginSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(mobileLoginSchema.safeParse({ email: "not-email", password: "x" }).success).toBe(false);
  });

  it("rejects empty password", () => {
    expect(mobileLoginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("mobileSessionSchema", () => {
  it("validates a well-formed session", () => {
    const session = {
      token: "a".repeat(64),
      expiresAt: "2026-12-31T23:59:59Z",
      user: { id: "u1", name: "Test", email: "t@t.com" },
    };
    expect(mobileSessionSchema.safeParse(session).success).toBe(true);
  });

  it("rejects token shorter than 40 chars", () => {
    const session = {
      token: "short",
      expiresAt: "2026-12-31T23:59:59Z",
      user: { id: "u1", name: null, email: "t@t.com" },
    };
    expect(mobileSessionSchema.safeParse(session).success).toBe(false);
  });
});

describe("restaurantsSchema", () => {
  it("accepts empty restaurant list", () => {
    expect(restaurantsSchema.safeParse({ restaurants: [] }).success).toBe(true);
  });

  it("validates a restaurant with locations", () => {
    const data = {
      restaurants: [
        { id: "r1", name: "Cafe", city: null, role: "OWNER", locations: [{ id: "l1", name: "Main" }] },
      ],
    };
    expect(restaurantsSchema.safeParse(data).success).toBe(true);
  });
});

describe("overviewSchema", () => {
  const validOverview = {
    restaurantId: "r1",
    locationId: null,
    generatedAt: "2026-09-23T10:00:00Z",
    period: { from: "2026-09-01", to: "2026-09-30" },
    currency: "USD" as const,
    source: {
      kind: "DEMO" as const,
      provider: "Demo",
      syncedAt: "2026-09-23T10:00:00Z",
      state: "demo" as const,
    },
    scope: "restaurant" as const,
    kpis: {
      netSales: 50000,
      unitsSold: 3000,
      theoreticalCost: 12000,
      targetFoodCostPct: 25,
      actualFoodCostPct: 28.5,
      unexplainedCost: 1500,
      operatingExpenses: 8000,
      netProfit: 5000,
    },
    channels: [{ name: "Dine-in", sales: 30000 }],
    alerts: [
      { id: "a1", kind: "variance" as const, severity: "high" as const, subject: "Beef", value: 500 },
    ],
  };

  it("accepts a complete overview", () => {
    expect(overviewSchema.safeParse(validOverview).success).toBe(true);
  });

  it("accepts null kpis and source", () => {
    const data = { ...validOverview, kpis: null, source: null, period: null };
    expect(overviewSchema.safeParse(data).success).toBe(true);
  });

  it("rejects invalid currency", () => {
    const data = { ...validOverview, currency: "EUR" };
    expect(overviewSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid alert kind", () => {
    const data = {
      ...validOverview,
      alerts: [{ id: "a1", kind: "unknown", severity: "high", subject: "x", value: null }],
    };
    expect(overviewSchema.safeParse(data).success).toBe(false);
  });
});
