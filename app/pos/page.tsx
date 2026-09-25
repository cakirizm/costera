import { effectiveRole, requireTerminalStaff } from "@/lib/pos/staff-session";
import { redirect } from "next/navigation";
import { FloorPlan } from "@/components/pos/FloorPlan";
import { getAppLocale } from "@/lib/costera/i18n";
import {
  getCounterOrders,
  getFloorPlan,
  hasTerminalSetup,
} from "@/lib/pos/terminal-repository";
import { getSessionContext, hasAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PosFloorPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const restaurantId = ctx?.restaurant?.id;



  if (!restaurantId) {
    return (
      <main className="pos-main">
        <div className="pos-empty">
          <h2>
            {locale === "tr"
              ? "Çalışma alanı bulunamadı."
              : "No workspace found."}
          </h2>
        </div>
      </main>
    );
  }

  const staff = await requireTerminalStaff(restaurantId);
  // KITCHEN belongs on the kitchen screen, not on the till.
  if (!hasAccess(effectiveRole(staff, ctx?.role ?? null), "/pos")) redirect("/pos/kds");

  const [areas, counterOrders, ready] = await Promise.all([
    getFloorPlan(restaurantId),
    getCounterOrders(restaurantId),
    hasTerminalSetup(restaurantId),
  ]);

  return (
    <FloorPlan
      locale={locale}
      currency={ctx?.restaurant?.currency ?? "TRY"}
      areas={areas}
      counterOrders={counterOrders.map((order) => ({
        id: order.id,
        code: order.code,
        totalMinor: order.totalMinor,
        channel: order.channel,
      }))}
      ready={ready}
    />
  );
}
