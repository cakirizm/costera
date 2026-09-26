import { requireTerminalStaff } from "@/lib/pos/staff-session";
import { notFound, redirect } from "next/navigation";
import { PaymentPanel } from "@/components/pos/PaymentPanel";
import { getAppLocale } from "@/lib/costera/i18n";
import { isPosError } from "@/lib/pos/errors";
import { getOrderWithDue } from "@/lib/pos/payment-service";
import { prisma } from "@/lib/prisma";
import { getSessionContext, hasAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PosPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  if (!ctx?.restaurant?.id || !ctx.membershipId) notFound();
  // KITCHEN belongs on the kitchen screen, not on the till.
  if (!hasAccess(ctx.role, "/pos")) redirect("/pos/kds");


  await requireTerminalStaff(ctx.restaurant.id);

  const actor = {
    restaurantId: ctx.restaurant.id,
    membershipId: ctx.membershipId,
  };

  const loaded = await loadPayment(actor, orderId);
  if (!loaded) notFound();
  const { order, dueMinor, payments } = loaded;

  return (
    <PaymentPanel
      locale={locale}
      currency={ctx.restaurant.currency}
      dueMinor={dueMinor}
      order={{
        id: order.id,
        code: order.code,
        status: order.status,
        subtotalMinor: order.subtotalMinor,
        discountMinor: order.discountMinor,
        taxMinor: order.taxMinor,
        totalMinor: order.totalMinor,
        paidMinor: order.paidMinor,
        lines: order.lines
          .filter((line) => line.status !== "VOID")
          .map((line) => ({
            id: line.id,
            name: line.name,
            quantity: line.quantity,
            lineTotalMinor: line.lineTotalMinor,
          })),
      }}
      payments={payments}
    />
  );
}

async function loadPayment(actor: { restaurantId: string; membershipId: string }, orderId: string) {
  try {
    const [{ order, dueMinor }, payments] = await Promise.all([
      getOrderWithDue(actor, orderId),
      prisma.posPayment.findMany({
        where: { orderId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          method: true,
          amountMinor: true,
          changeMinor: true,
        },
      }),
    ]);
    return { order, dueMinor, payments };
  } catch (error) {
    if (isPosError(error)) return null;
    throw error;
  }
}
