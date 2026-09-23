// Tests for lib/session.ts pure helpers: roleLabel and initials
// Importers: vitest runner via `npm test`
// Callers: roleLabel is used by COSTERAAppShell.tsx sidebar; initials is used by dashboard header avatar
// Affected API: none — pure functions, no DB/network
// Data schemas: SessionContext type (user/restaurant/role/locationCount)
// User instruction: "faz 7yi tamamla" — ek birim testleri planın parçası, kullanıcı planı "evet" ile onayladı
import { describe, it, expect, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { roleLabel, initials, hasAccess } from "./session";

describe("roleLabel", () => {
  it("returns Turkish label when tr is true", () => {
    expect(roleLabel("OWNER", true)).toBe("Sahip");
    expect(roleLabel("MANAGER", true)).toBe("Yönetici");
    expect(roleLabel("KITCHEN", true)).toBe("Mutfak");
    expect(roleLabel("FINANCE", true)).toBe("Finans");
  });

  it("returns English label when tr is false", () => {
    expect(roleLabel("OWNER", false)).toBe("Owner");
    expect(roleLabel("MANAGER", false)).toBe("Manager");
  });

  it("returns Arabic label when locale is ar", () => {
    expect(roleLabel("OWNER", "ar")).toBe("مالك");
    expect(roleLabel("MANAGER", "ar")).toBe("مدير");
  });

  it("returns default for null role", () => {
    expect(roleLabel(null, true)).toBe("Üye");
    expect(roleLabel(null, false)).toBe("Member");
    expect(roleLabel(null, "ar")).toBe("عضو");
  });

  it("returns raw role string for unknown roles", () => {
    expect(roleLabel("ADMIN", false)).toBe("ADMIN");
    expect(roleLabel("ADMIN", true)).toBe("ADMIN");
  });
});

describe("initials", () => {
  it("takes first letter of first two words", () => {
    expect(initials("Sedat Enes", null)).toBe("SE");
  });

  it("falls back to email when name is null", () => {
    expect(initials(null, "test@costera.app")).toBe("TE");
  });

  it("uses first two chars for single-word name", () => {
    expect(initials("Ali", null)).toBe("AL");
  });

  it("returns ? prefix when both are null", () => {
    expect(initials(null, null)).toBe("?");
  });

  it("handles whitespace-only name by falling through to trimmed empty", () => {
    expect(initials("   ", "x@y.com")).toBe("");
  });
});

describe("hasAccess", () => {
  it("OWNER can access all pages", () => {
    expect(hasAccess("OWNER", "/dashboard")).toBe(true);
    expect(hasAccess("OWNER", "/dashboard/finance")).toBe(true);
    expect(hasAccess("OWNER", "/dashboard/settings")).toBe(true);
    expect(hasAccess("OWNER", "/dashboard/integrations")).toBe(true);
  });

  it("KITCHEN can access inventory and recipes but not finance", () => {
    expect(hasAccess("KITCHEN", "/dashboard")).toBe(true);
    expect(hasAccess("KITCHEN", "/dashboard/inventory")).toBe(true);
    expect(hasAccess("KITCHEN", "/dashboard/recipes")).toBe(true);
    expect(hasAccess("KITCHEN", "/dashboard/finance")).toBe(false);
    expect(hasAccess("KITCHEN", "/dashboard/settings")).toBe(false);
  });

  it("FINANCE can access finance and reports but not inventory", () => {
    expect(hasAccess("FINANCE", "/dashboard")).toBe(true);
    expect(hasAccess("FINANCE", "/dashboard/finance")).toBe(true);
    expect(hasAccess("FINANCE", "/dashboard/reports")).toBe(true);
    expect(hasAccess("FINANCE", "/dashboard/inventory")).toBe(false);
  });

  it("returns false for null role", () => {
    expect(hasAccess(null, "/dashboard")).toBe(false);
  });

  it("returns true for unknown paths (no restriction defined)", () => {
    expect(hasAccess("KITCHEN", "/dashboard/unknown")).toBe(true);
  });
});
