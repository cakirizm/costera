import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const MOBILE_SESSION_TTL = 30 * 24 * 60 * 60 * 1000;
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export function bearerToken(request: Request) {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get("authorization") ?? "");
  return match?.[1] ?? null;
}
export async function issueMobileSession(user: { id: string; passwordHash: string }, now = new Date()) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + MOBILE_SESSION_TTL);
  await prisma.mobileSession.create({ data: {
    userId: user.id, tokenHash: digest(token), credentialVersion: digest(user.passwordHash), expiresAt,
  } });
  return { token, expiresAt: expiresAt.toISOString() };
}
export async function authenticateMobile(request: Request, now = new Date()) {
  const token = bearerToken(request);
  if (!token) return null;
  const session = await prisma.mobileSession.findUnique({
    where: { tokenHash: digest(token) },
    include: { user: { select: { id: true, passwordHash: true } } },
  });
  // Password resets invalidate native sessions without changing the web reset flow.
  if (!session || session.expiresAt <= now || session.credentialVersion !== digest(session.user.passwordHash)) return null;
  return { userId: session.userId, tokenHash: session.tokenHash };
}
export async function allowMobileLogin(email: string, now = new Date()) {
  const windowMs = 15 * 60 * 1000;
  const bucket = Math.floor(now.getTime() / windowMs);
  const expiresAt = new Date((bucket + 1) * windowMs);
  const key = digest(`${email}:${bucket}`);
  const window = await prisma.mobileLoginWindow.upsert({
    where: { id: key }, create: { id: key, attempts: 1, expiresAt },
    update: { attempts: { increment: 1 } },
  });
  return { allowed: window.attempts <= 10, retryAfter: Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)) };
}
