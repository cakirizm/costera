import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const locale = body.locale === "tr" ? "tr" : "en";

  const response = NextResponse.json({ ok: true, locale });
  response.cookies.set("costera_app_lang", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });
  return response;
}
