import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

describe("application language", () => {
  it.each(["en", "tr", "ar"])("persists %s as a secure language preference", async (locale) => {
    const response = await POST(new NextRequest("http://localhost/api/app-language", {
      method: "POST", body: JSON.stringify({ locale }),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, locale });
    expect(response.cookies.get("costera_app_lang")).toMatchObject({ value: locale, path: "/", httpOnly: true, sameSite: "lax" });
  });
  it.each(['{"locale":"fr"}', 'null', '{}', '{invalid'])('rejects invalid input without changing the preference: %s', async (body) => {
    const response = await POST(new NextRequest("http://localhost/api/app-language", { method: "POST", body }));
    expect(response.status).toBe(400);
    expect(response.cookies.get("costera_app_lang")).toBeUndefined();
  });
});
