import { NextResponse } from "next/server";
export const mobileJson = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", "Vary": "Authorization", ...headers } });
export async function mobileHandler(handler: () => Promise<Response>) {
  try { return await handler(); }
  catch { return mobileJson({ error: "SERVER_UNAVAILABLE" }, 503); }
}
