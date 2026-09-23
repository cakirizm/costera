import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("next-auth", () => ({ default: () => ({ auth: (handler: unknown) => handler }) }));
import middleware from "./middleware";
const run = middleware as unknown as (request: NextRequest & { auth: unknown }) => Response;
function request(path: string, cookie = "", auth: unknown = null) {
  return Object.assign(new NextRequest(`http://localhost${path}`, { headers: { cookie } }), { auth });
}
describe("localized middleware", () => {
  it("keeps unauthenticated dashboard requests protected", () => {
    const response = run(request("/dashboard/finance", "costera_app_lang=ar"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/ar/login?callbackUrl=");
  });
  it("allows authenticated dashboard requests with the saved language", () => {
    const response = run(request("/dashboard", "costera_app_lang=ar", { user: { id: "test" } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-request-x-costera-locale")).toBe("ar");
  });
  it("uses the route language for public pages despite a previous preference", () => {
    const response = run(request("/ar/pricing", "costera_app_lang=en"));
    expect(response.headers.get("x-middleware-request-x-costera-locale")).toBe("ar");
    expect(response.headers.get("set-cookie")).toContain("costera_app_lang=ar");
  });
  it("can switch a saved Arabic authentication screen back to English", () => {
    const response = run(request("/login?lang=en", "costera_app_lang=ar"));
    expect(response.headers.get("x-middleware-request-x-costera-locale")).toBe("en");
    expect(response.headers.get("set-cookie")).toContain("costera_app_lang=en");
  });
  it("does not change preferences during prefetch", () => {
    const req = request("/ar", "costera_app_lang=en");
    req.headers.set("next-router-prefetch", "1");
    expect(run(req).headers.get("set-cookie")).toBeNull();
  });
});
