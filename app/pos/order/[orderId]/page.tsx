import { effectiveRole, requireTerminalStaff } from "@/lib/pos/staff-session";
import { notFound, redirect } from "next/navigation";
import { OrderTerminal } from "@/components/pos/OrderTerminal";
import { getAppLocale } from "@/lib/costera/i18n";
import { isPosError } from "@/lib/pos/errors";
import { getOrder } from "@/lib/pos/order-service";
import { getTerminalMenu } from "@/lib/pos/terminal-repository";
import { getSessionContext, hasAccess } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PosOrderPage({
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

  const staff = await requireTerminalStaff(ctx.restaurant.id);
  const role = effectiveRole(staff, ctx.role);

  const actor = {
    restaurantId: ctx.restaurant.id,
    membershipId: ctx.membershipId,
  };

  // notFound() throws, so the lookup is resolved before any JSX is built.
  const loaded = await loadOrder(actor, orderId, ctx.restaurant.id);
  if (!loaded) notFound();
  const { order, menu } = loaded;

  return (
    <OrderTerminal
      locale={locale}
      currency={ctx.restaurant.currency}
      canApproveWriteOffs={role === "OWNER" || role === "MANAGER"}
      menu={menu}
      order={{
        id: order.id,
        code: order.code,
        status: order.status,
        subtotalMinor: order.subtotalMinor,
        discountMinor: order.discountMinor,
        taxMinor: order.taxMinor,
        totalMinor: order.totalMinor,
        paidMinor: order.paidMinor,
        lines: order.lines.map((line) => ({
          id: line.id,
          // Lets the terminal drop an optimistic line once the server has it.
          clientLineId: line.clientLineId,
          name: line.name,
          quantity: line.quantity,
          lineTotalMinor: line.lineTotalMinor,
          status: line.status,
          isComped: line.isComped,
          note: line.note,
          modifiers: line.modifiers.map((m) => ({ id: m.id, name: m.name })),
        })),
      }}
    />
  );
}

async function loadOrder(
  actor: { restaurantId: string; membershipId: string },
  orderId: string,
  restaurantId: string,
) {
  try {
    const [order, menu] = await Promise.all([
      getOrder(actor, orderId),
      getTerminalMenu(restaurantId),
    ]);
    return { order, menu };
  } catch (error) {
    if (isPosError(error)) return null;
    throw error;
  }
}
