import Link from "next/link";
import { LockButton } from "@/components/pos/LockButton";
import { ServiceWorkerBridge } from "@/components/pos/ServiceWorkerBridge";
import { redirect } from "next/navigation";
import { getAppLocale } from "@/lib/costera/i18n";
import { tx } from "@/lib/costera/locale";
import { moneyMinor } from "@/lib/pos/money";
import { currentShift } from "@/lib/pos/shift-service";
import { effectiveRole, getActiveStaff } from "@/lib/pos/staff-session";
import { getSessionContext, hasAccess, roleLabel } from "@/lib/session";

export const metadata = {
  title: "COSTERA POS",
  manifest: "/manifest.webmanifest",
};

export const dynamic = "force-dynamic";

/**
 * The terminal runs outside the dashboard shell on purpose: a cashier needs the
 * whole screen, and the analytics navigation is noise (and a privilege) they do
 * not have during service.
 */
export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  // Per-path role checks live in the pages themselves; a cook may reach
  // /pos/kds without being allowed on the till.
  if (!hasAccess(ctx.role, "/pos") && !hasAccess(ctx.role, "/pos/kds")) redirect("/dashboard");

  const [shift, staff] = await Promise.all([
    ctx.restaurant ? currentShift(ctx.restaurant.id) : null,
    ctx.restaurant ? getActiveStaff(ctx.restaurant.id) : null,
  ]);
  const currency = ctx.restaurant?.currency ?? "TRY";

  return (
    <div className="pos-root">
      <ServiceWorkerBridge />
      <header className="pos-topbar">
        <Link href="/pos" className="pos-brand">
          COSTERA POS
        </Link>
        <span className="pos-venue">
          {ctx.restaurant?.name ??
            tx(locale, "No workspace", "Çalışma alanı yok")}
        </span>
        <span className="pos-topbar-spacer" />

        {/* The chip is the way into the drawer screen, so it is a link for
            anyone allowed to open or count a shift. */}
        {hasAccess(effectiveRole(staff, ctx.role), "/pos/shift") ? (
          <Link href="/pos/shift" className={shift ? "pos-chip" : "pos-chip warn"}>
            {shift ? (
              <>
                {tx(locale, "Shift", "Vardiya")}{" "}
                <b>{moneyMinor(shift.openingCashMinor, currency)}</b>
              </>
            ) : (
              tx(locale, "No open shift", "Açık vardiya yok")
            )}
          </Link>
        ) : null}

        <span className="pos-chip">
          {staff?.name ?? ctx.user.name ?? ctx.user.email}{" "}
          <b>{roleLabel(staff?.role ?? ctx.role, locale)}</b>
        </span>

        {staff && <LockButton locale={locale} />}

        {/* Not shown to a PIN holder who has no business in the dashboard: the
            browser session may be the owner's, but the person at the till is a
            waiter. This hides the door; it does not lock it, because the
            dashboard still trusts the browser session. Locking the till before
            leaving it unattended is still the operator's job. */}
        {hasAccess(effectiveRole(staff, ctx.role), "/dashboard") && (
          <Link href="/dashboard" className="pos-chip">
            {tx(locale, "Exit", "Çıkış")}
          </Link>
        )}
      </header>

      <div className="pos-body">{children}</div>
    </div>
  );
}
