import { redirect } from "next/navigation";
import {
  effectiveRole,
  getActiveStaff,
  isTillDevice,
  terminalUsesPins,
} from "@/lib/pos/staff-session";
import { getSessionContext, hasAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Keeps the dashboard behind the same identity the till uses.
 *
 * Without this the PIN lock only hides the door: the browser session belongs to
 * the owner, so anyone holding the tablet could reach the dashboard by locking
 * the terminal first. On a browser that has been used as a till, the dashboard
 * now asks who is standing there, and a waiter or cashier is sent back to the
 * terminal instead.
 *
 * A browser that has never been a till is untouched, so an owner working from a
 * laptop never sees a PIN pad.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");

  const restaurantId = ctx.restaurant?.id;
  if (!restaurantId) return <>{children}</>;

  if (!(await isTillDevice())) return <>{children}</>;

  // The marker only bites while the venue actually uses PINs. Drop them all and
  // a till tablet must not be left with an unreachable dashboard.
  if (!(await terminalUsesPins(restaurantId))) return <>{children}</>;

  const staff = await getActiveStaff(restaurantId);
  if (!staff) redirect("/pos/lock");
  if (!hasAccess(effectiveRole(staff, ctx.role), "/dashboard")) redirect("/pos");

  return <>{children}</>;
}
