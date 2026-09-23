import { mobileLoginSchema } from "@/shared/mobile-contract";
import { verifyCredentials } from "@/lib/credentials";
import { allowMobileLogin, issueMobileSession } from "@/lib/mobile/auth";
import { mobileHandler, mobileJson } from "@/lib/mobile/http";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return mobileHandler(async () => {
    const body = mobileLoginSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return mobileJson({ error: "INVALID_CREDENTIALS" }, 401);
    const limit = await allowMobileLogin(body.data.email);
    if (!limit.allowed) return mobileJson({ error: "RATE_LIMITED" }, 429, { "Retry-After": String(limit.retryAfter) });
    const user = await verifyCredentials(body.data);
    if (!user) return mobileJson({ error: "INVALID_CREDENTIALS" }, 401);
    // Bounded retention: expired sessions and old login windows are not useful.
    await Promise.all([
      prisma.mobileSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
      prisma.mobileLoginWindow.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 86400000) } } }),
    ]);
    const session = await issueMobileSession(user);
    return mobileJson({ ...session, user: { id: user.id, name: user.name, email: user.email } });
  });
}
