import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Device authentication for the local bridge.
 *
 * Same shape as MobileSession: the raw token is shown to the operator once, at
 * enrolment, and only its SHA-256 digest is stored. A stolen database therefore
 * cannot be used to impersonate a till.
 */

export const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export function bearerToken(request: Request): string | null {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get("authorization") ?? "");
  return match?.[1] ?? null;
}

export type BridgeDevice = { deviceId: string; restaurantId: string; name: string };

export async function authenticateDevice(request: Request): Promise<BridgeDevice | null> {
  const token = bearerToken(request);
  if (!token) return null;

  const device = await prisma.posDevice.findUnique({
    where: { tokenHash: digest(token) },
    select: { id: true, restaurantId: true, name: true, active: true },
  });
  if (!device || !device.active) return null;

  return { deviceId: device.id, restaurantId: device.restaurantId, name: device.name };
}

/** Creates the device and returns the only copy of its token. */
export async function enrolDevice(
  restaurantId: string,
  name: string,
  kind: string,
): Promise<{ deviceId: string; token: string }> {
  const token = randomBytes(32).toString("base64url");
  const device = await prisma.posDevice.create({
    data: {
      restaurantId,
      name,
      kind,
      tokenHash: digest(token),
      credentialVersion: randomBytes(8).toString("hex"),
    },
    select: { id: true },
  });
  return { deviceId: device.id, token };
}

export async function touchDevice(deviceId: string, now = new Date()): Promise<void> {
  await prisma.posDevice.update({ where: { id: deviceId }, data: { lastSeenAt: now } });
}
