import { NextRequest, NextResponse } from "next/server";

import { isAppLocale } from "@/lib/costera/locale";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (!isAppLocale(body?.locale)) return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  const locale = body.locale;

  const response = NextResponse.json({ ok: true, locale });
  response.cookies.set("costera_app_lang", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });
  return response;
}
