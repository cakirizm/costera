import { effectiveRole, requireTerminalStaff } from "@/lib/pos/staff-session";
import { redirect } from "next/navigation";
import { KitchenDisplay } from "@/components/pos/KitchenDisplay";
import { getAppLocale } from "@/lib/costera/i18n";
import { getKdsTickets, getStations } from "@/lib/pos/kds-repository";
import { getSessionContext, hasAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function KdsPage({
  searchParams,
}: {
  searchParams: Promise<{ station?: string }>;
}) {
  const { station } = await searchParams;
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const restaurantId = ctx?.restaurant?.id;
  if (!restaurantId) redirect("/dashboard");

  const staff = await requireTerminalStaff(restaurantId);
  const role = effectiveRole(staff, ctx?.role ?? null);
  if (!hasAccess(role, "/pos/kds")) redirect("/pos");

  const stations = await getStations(restaurantId);
  const active = station && stations.includes(station) ? station : null;
  const tickets = await getKdsTickets(restaurantId, active);

  return (
    <KitchenDisplay
      locale={locale}
      stations={stations}
      activeStation={active}
      canReturnToTill={hasAccess(role, "/pos")}
      tickets={tickets.map((ticket) => ({
        ...ticket,
        since: ticket.since.toISOString(),
        lines: ticket.lines.map((line) => ({ ...line, sentAt: line.sentAt?.toISOString() ?? null })),
      }))}
    />
  );
}
