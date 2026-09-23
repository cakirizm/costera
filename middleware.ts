import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { isAppLocale } from "@/lib/costera/locale";

const { auth } = NextAuth(authConfig);
export default auth((request) => {
  const path = request.nextUrl.pathname;
  const segment = path.split("/")[1];
  const saved = request.cookies.get("costera_app_lang")?.value;
  const requested = request.nextUrl.searchParams.get("lang");
  const isApp = path.startsWith("/dashboard") || /^\/(login|register|forgot-password|reset-password)(\/|$)/.test(path);
  const locale = segment === "ar" || segment === "tr" ? segment : isApp && isAppLocale(requested) ? requested : isApp && isAppLocale(saved) ? saved : "en";
  // A custom Auth.js middleware callback must enforce the dashboard guard itself.
  if (path.startsWith("/dashboard") && !request.auth?.user) {
    const signInUrl = new URL(locale === "ar" ? "/ar/login" : "/login", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }
  const headers = new Headers(request.headers);
  headers.set("x-costera-locale", locale);
  const response = NextResponse.next({ request: { headers } });
  if (!request.headers.has("next-router-prefetch") && request.headers.get("purpose") !== "prefetch" && saved !== locale && (!isApp || isAppLocale(requested) || segment === "ar" || segment === "tr")) {
    response.cookies.set("costera_app_lang", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  }
  return response;
});
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
