import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PosError } from "./errors";

/**
 * Terminal staff.
 *
 * A waiter or a cook has no business with a web login: they sign in at a till
 * that is already authenticated, with a PIN. Their User row exists only to hang
 * a Membership off, is flagged terminalOnly so it can never authenticate, and
 * carries an unguessable password no one is ever told.
 */

const PIN_COST = 12;

/** Four to six digits. Longer is not typed reliably on a till during service. */
export function isValidPin(pin: string): boolean {
  return /^[0-9]{4,6}$/.test(pin);
}

export type StaffRow = {
  membershipId: string;
  name: string;
  role: Role;
  terminalOnly: boolean;
  hasPin: boolean;
};

export async function listStaff(restaurantId: string): Promise<StaffRow[]> {
  const memberships = await prisma.membership.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true, email: true, terminalOnly: true } },
      posPin: { select: { id: true } },
    },
  });

  return memberships.map((membership) => ({
    membershipId: membership.id,
    name: membership.user.name ?? membership.user.email,
    role: membership.role,
    terminalOnly: membership.user.terminalOnly,
    hasPin: Boolean(membership.posPin),
  }));
}

export async function createTerminalStaff(
  restaurantId: string,
  name: string,
  role: Role,
  pin: string,
): Promise<{ membershipId: string }> {
  if (!isValidPin(pin)) throw new PosError("INVALID_INPUT", "A PIN is 4 to 6 digits.");

  const [pinHash, passwordHash] = await Promise.all([
    bcrypt.hash(pin, PIN_COST),
    bcrypt.hash(randomBytes(24).toString("base64url"), 12),
  ]);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        // Not a routable address on purpose: nothing should ever mail it, and
        // the reset flow must not offer this account a way in.
        email: `staff-${randomBytes(9).toString("hex")}@pos.local`,
        passwordHash,
        terminalOnly: true,
        name,
      },
    });
    const membership = await tx.membership.create({
      data: { userId: user.id, restaurantId, role },
    });
    await tx.posStaffPin.create({ data: { membershipId: membership.id, pinHash } });
    return { membershipId: membership.id };
  });
}

export async function setStaffPin(
  restaurantId: string,
  membershipId: string,
  pin: string,
): Promise<void> {
  if (!isValidPin(pin)) throw new PosError("INVALID_INPUT", "A PIN is 4 to 6 digits.");

  const membership = await prisma.membership.findFirst({ where: { id: membershipId, restaurantId } });
  if (!membership) throw new PosError("INVALID_INPUT", "Staff member not found.");

  const pinHash = await bcrypt.hash(pin, PIN_COST);
  await prisma.posStaffPin.upsert({
    where: { membershipId },
    create: { membershipId, pinHash },
    update: { pinHash },
  });
}

/**
 * Take a staff member off the tills.
 *
 * The membership stays: it is named by every ticket, void and cash movement
 * they touched, and that trail must not disappear when someone leaves. Removing
 * the PIN is what actually stops them signing in.
 */
export async function revokeStaffPin(restaurantId: string, membershipId: string): Promise<void> {
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, restaurantId } });
  if (!membership) throw new PosError("INVALID_INPUT", "Staff member not found.");
  await prisma.posStaffPin.deleteMany({ where: { membershipId } });
}

export type PinMatch = { membershipId: string; role: Role; name: string };

/**
 * Find which staff member a PIN belongs to.
 *
 * Every candidate is checked even after a match so the time taken does not
 * depend on where in the list the right person sits. Restricted to one
 * restaurant, so a PIN can never unlock a different venue.
 */
export async function findStaffByPin(restaurantId: string, pin: string): Promise<PinMatch | null> {
  if (!isValidPin(pin)) return null;

  const candidates = await prisma.posStaffPin.findMany({
    where: { membership: { restaurantId } },
    include: { membership: { include: { user: { select: { name: true, email: true } } } } },
  });

  let match: PinMatch | null = null;
  for (const candidate of candidates) {
    const ok = await bcrypt.compare(pin, candidate.pinHash);
    if (ok && !match) {
      match = {
        membershipId: candidate.membershipId,
        role: candidate.membership.role,
        name: candidate.membership.user.name ?? candidate.membership.user.email,
      };
    }
  }
  return match;
}
