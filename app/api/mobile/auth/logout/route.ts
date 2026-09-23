import { bearerToken, digest } from "@/lib/mobile/auth";
import { mobileHandler, mobileJson } from "@/lib/mobile/http";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return mobileHandler(async () => {
    const token = bearerToken(request);
    if (!token) return mobileJson({ error: "UNAUTHORIZED" }, 401);
    await prisma.mobileSession.deleteMany({ where: { tokenHash: digest(token) } });
    return mobileJson({ ok: true });
  });
}
