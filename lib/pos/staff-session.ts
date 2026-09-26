import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RoleType } from "@/lib/session";

/**
 * Which staff member is currently at the till.
 *
 * The web session says the restaurant is authenticated; it does not say who is
 * standing in front of the screen. The PIN lock does, and it is what every
 * ticket, void and cash movement is attributed to.
 *
 * The cookie is httpOnly and signed with AUTH_SECRET, so a waiter cannot edit
 * it into a manager's membership. It is still only a claim about identity on a
 * shared device - the role it carries is re-read from the database on use.
 */

export const STAFF_COOKIE = "costera_pos_staff";
const STAFF_TTL_SECONDS = 12 * 60 * 60;

function sign(value: string): string {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function sealStaffCookie(membershipId: string): string {
  return `${membershipId}.${sign(membershipId)}`;
}

export function openStaffCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  const index = raw.lastIndexOf(".");
  if (index <= 0) return null;

  const membershipId = raw.slice(0, index);
  const signature = raw.slice(index + 1);
  const expected = sign(membershipId);
  if (signature.length !== expected.length) return null;

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? membershipId : null;
}

export async function setActiveStaff(membershipId: string): Promise<void> {
  const store = await cookies();
  store.set(STAFF_COOKIE, sealStaffCookie(membershipId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: STAFF_TTL_SECONDS,
  });
}

export async function clearActiveStaff(): Promise<void> {
  const store = await cookies();
  store.delete(STAFF_COOKIE);
}

export type ActiveStaff = { membershipId: string; role: Role; name: string };

/**
 * Resolve the signed-in staff member, re-checking against the database that the
 * membership still exists, still belongs to this restaurant and still has a PIN.
 * Revoking a PIN therefore ends the session at the next action, not at the next
 * cookie expiry.
 */
export async function getActiveStaff(restaurantId: string): Promise<ActiveStaff | null> {
  const store = await cookies();
  const membershipId = openStaffCookie(store.get(STAFF_COOKIE)?.value);
  if (!membershipId) return null;

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, restaurantId, posPin: { isNot: null } },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!membership) return null;

  return {
    membershipId: membership.id,
    role: membership.role,
    name: membership.user.name ?? membership.user.email,
  };
}

/** True once anyone in this restaurant has a till PIN. */
export async function terminalUsesPins(restaurantId: string): Promise<boolean> {
  const count = await prisma.posStaffPin.count({ where: { membership: { restaurantId } } });
  return count > 0;
}

/**
 * Gate a terminal screen behind the PIN lock.
 *
 * Only once the venue has set up at least one PIN: a single-operator venue that
 * never configured staff keeps working on the account's own membership rather
 * than being locked out by a feature it did not ask for.
 */
export async function requireTerminalStaff(restaurantId: string): Promise<ActiveStaff | null> {
  const [staff, usesPins] = await Promise.all([
    getActiveStaff(restaurantId),
    terminalUsesPins(restaurantId),
  ]);
  if (usesPins && !staff) redirect("/pos/lock");
  return staff;
}

/**
 * The role that governs this screen.
 *
 * When someone is signed in with a PIN it is their role, not the account's.
 * Screens must use this for what they offer, or a waiter on the owner's
 * logged-in tablet is shown buttons the server will refuse - which reads as a
 * broken till rather than a permission boundary.
 */
export function effectiveRole(
  staff: ActiveStaff | null,
  accountRole: RoleType | null,
): RoleType | null {
  return staff?.role ?? accountRole;
}

/**
 * Marks a browser as a till.
 *
 * Locking the terminal clears the staff session, and without this the dashboard
 * would fall back to trusting the browser login again - so a waiter alone with
 * the owner's tablet could tap Lock and walk straight into the dashboard. Once a
 * browser has been used as a till it stays one, and the dashboard demands a PIN
 * with dashboard rights. An owner's own laptop never picks up this marker, so
 * working from a desk is unaffected.
 *
 * Signing out clears it, which is the way back if a laptop is marked by mistake.
 */
export const TILL_COOKIE = "costera_pos_till";
const TILL_TTL_SECONDS = 180 * 24 * 60 * 60;

export async function markDeviceAsTill(): Promise<void> {
  const store = await cookies();
  store.set(TILL_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: TILL_TTL_SECONDS,
  });
}

export async function isTillDevice(): Promise<boolean> {
  const store = await cookies();
  return store.get(TILL_COOKIE)?.value === "1";
}

export async function clearTillMarker(): Promise<void> {
  const store = await cookies();
  store.delete(TILL_COOKIE);
}
