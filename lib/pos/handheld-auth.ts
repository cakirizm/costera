import { createHash, randomBytes } from "node:crypto";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { allowPinAttempt, clearPinAttempts, findStaffByPin } from "./staff";

/**
 * Authentication for the waiter handheld.
 *
 * Two facts, deliberately separate: the device token proves this phone was
 * enrolled by the owner, the PIN says who is carrying it. A stolen phone is
 * killed by revoking the device; a waiter who leaves is stopped by revoking the
 * PIN. Neither needs a password, so waiters still cannot reach the web.
 *
 * Nothing here reuses MobileSession. That one authenticates an account for the
 * owner's read-only monitor, and orders must never be writable from it.
 */

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export function handheldToken(request: Request): string | null {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get("authorization") ?? "");
  return match?.[1] ?? null;
}

/** Roles that may take orders at a table. */
const ORDER_TAKER_ROLES: Role[] = ["OWNER", "MANAGER", "CASHIER", "WAITER"];

export type HandheldActor = {
  sessionId: string;
  deviceId: string;
  deviceName: string;
  restaurantId: string;
  membershipId: string;
  staffName: string;
  role: Role;
  currency: string;
  venueName: string;
};

export type SignInResult =
  | { ok: true; token: string; expiresAt: Date; actor: HandheldActor }
  | { ok: false; error: "DEVICE_UNKNOWN" | "PIN_REJECTED" | "TOO_MANY_ATTEMPTS" | "NOT_A_WAITER" };

/**
 * Exchange an enrolment token and a PIN for a session.
 *
 * The device is looked up first so a PIN is never even checked against an
 * unknown phone, and the attempt limiter is shared with the till: someone
 * guessing PINs on a handheld is the same attacker.
 */
export async function signInHandheld(
  deviceToken: string,
  pin: string,
  now = new Date(),
): Promise<SignInResult> {
  const device = await prisma.posDevice.findUnique({
    where: { tokenHash: digest(deviceToken) },
    include: { restaurant: { select: { id: true, name: true, currency: true } } },
  });
  if (!device || !device.active) return { ok: false, error: "DEVICE_UNKNOWN" };

  const gate = await allowPinAttempt(device.restaurantId, now);
  if (!gate.allowed) return { ok: false, error: "TOO_MANY_ATTEMPTS" };

  const staff = await findStaffByPin(device.restaurantId, pin);
  if (!staff) return { ok: false, error: "PIN_REJECTED" };
  if (!ORDER_TAKER_ROLES.includes(staff.role)) return { ok: false, error: "NOT_A_WAITER" };

  await clearPinAttempts(device.restaurantId, now);

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  const session = await prisma.posDeviceSession.create({
    data: {
      deviceId: device.id,
      membershipId: staff.membershipId,
      tokenHash: digest(token),
      credentialVersion: device.credentialVersion,
      expiresAt,
    },
  });
  await prisma.posDevice.update({ where: { id: device.id }, data: { lastSeenAt: now } });

  return {
    ok: true,
    token,
    expiresAt,
    actor: {
      sessionId: session.id,
      deviceId: device.id,
      deviceName: device.name,
      restaurantId: device.restaurantId,
      membershipId: staff.membershipId,
      staffName: staff.name,
      role: staff.role,
      currency: device.restaurant.currency,
      venueName: device.restaurant.name,
    },
  };
}

/**
 * Resolve a request's session.
 *
 * The device, the membership and the PIN are all re-checked: revoking any one
 * of them ends every session on the next request rather than at expiry.
 */
export async function authenticateHandheld(
  request: Request,
  now = new Date(),
): Promise<HandheldActor | null> {
  const token = handheldToken(request);
  if (!token) return null;

  const session = await prisma.posDeviceSession.findUnique({
    where: { tokenHash: digest(token) },
    include: {
      device: { include: { restaurant: { select: { name: true, currency: true } } } },
      membership: {
        include: { user: { select: { name: true, email: true } }, posPin: { select: { id: true } } },
      },
    },
  });

  if (!session || session.expiresAt <= now) return null;
  if (!session.device.active) return null;
  if (session.credentialVersion !== session.device.credentialVersion) return null;
  if (!session.membership || !session.membership.posPin) return null;

  return {
    sessionId: session.id,
    deviceId: session.deviceId,
    deviceName: session.device.name,
    restaurantId: session.device.restaurantId,
    membershipId: session.membership.id,
    staffName: session.membership.user.name ?? session.membership.user.email,
    role: session.membership.role,
    currency: session.device.restaurant.currency,
    venueName: session.device.restaurant.name,
  };
}

export async function signOutHandheld(sessionId: string): Promise<void> {
  await prisma.posDeviceSession.deleteMany({ where: { id: sessionId } });
}
