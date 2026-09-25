import { effectiveRole, requireTerminalStaff } from "@/lib/pos/staff-session";
import { redirect } from "next/navigation";
import { ShiftPanel } from "@/components/pos/ShiftPanel";
import { getAppLocale } from "@/lib/costera/i18n";
import { currentShift, summariseShift } from "@/lib/pos/shift-service";
import { prisma } from "@/lib/prisma";
import { getSessionContext, hasAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PosShiftPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const restaurantId = ctx?.restaurant?.id;
  if (!restaurantId) redirect("/dashboard");

  const staff = await requireTerminalStaff(restaurantId);
  if (!hasAccess(effectiveRole(staff, ctx?.role ?? null), "/pos/shift")) redirect("/pos");

  const shift = await currentShift(restaurantId);
  if (!shift) {
    return <ShiftPanel locale={locale} currency={ctx?.restaurant?.currency ?? "TRY"} shift={null} />;
  }

  const [summary, movements, unpaidCount] = await Promise.all([
    summariseShift(restaurantId, shift.id),
    prisma.posCashMovement.findMany({
      where: { shiftId: shift.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, type: true, amountMinor: true, reason: true },
    }),
    prisma.posOrder.count({
      where: { shiftId: shift.id, status: { in: ["OPEN", "SENT", "PARTIALLY_PAID"] } },
    }),
  ]);

  return (
    <ShiftPanel
      locale={locale}
      currency={ctx?.restaurant?.currency ?? "TRY"}
      shift={{
        id: shift.id,
        openedAt: shift.openedAt.toISOString(),
        openingCashMinor: shift.openingCashMinor,
        summary,
        movements,
        unpaidCount,
      }}
    />
  );
}
