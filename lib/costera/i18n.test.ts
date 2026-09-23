// Tests for lib/costera/i18n.ts — getAppLocale and getRequestLocale
// Importers: vitest runner via `npm test`
// Callers: getAppLocale is used by all dashboard pages and layout.tsx; getRequestLocale by middleware
// Affected API: reads costera_app_lang cookie and x-costera-locale header
// Data schemas: AppLocale = "en" | "tr" | "ar"
// User instruction: "faz 7yi tamamla" — i18n testleri planın parçası, kullanıcı "evet" ile onayladı
import { describe, it, expect, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: () => undefined }),
  headers: () => Promise.resolve({ get: () => null }),
}));

describe("getAppLocale", () => {
  it("defaults to en when no cookie is set", async () => {
    const { getAppLocale } = await import("./i18n");
    expect(await getAppLocale()).toBe("en");
  });
});

describe("getRequestLocale", () => {
  it("falls back to getAppLocale when header is absent", async () => {
    const { getRequestLocale } = await import("./i18n");
    expect(await getRequestLocale()).toBe("en");
  });
});
