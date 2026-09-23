import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput, getDataSource, getExpenses } from "@/lib/costera/repository";
import { buildMobileOverview } from "@/lib/mobile/overview";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import type { MobileOverview } from "@/shared/mobile-contract";

const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const pct = (n: number) => n.toFixed(1) + "%";

function KpiCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" | "warn" }) {
  return (
    <div className={`m-kpi ${tone ?? ""}`}>
      <span className="m-kpi-label">{label}</span>
      <strong className="m-kpi-value">{value}</strong>
      {sub && <small className="m-kpi-sub">{sub}</small>}
    </div>
  );
}

function AlertRow({ alert, locale }: { alert: MobileOverview["alerts"][number]; locale: string }) {
  const kindLabel: Record<string, Record<string, string>> = {
    variance: { en: "Variance", tr: "Fark" },
    "missing-menu": { en: "Missing menu item", tr: "Eksik menü ürünü" },
    "missing-ingredient": { en: "Missing ingredient", tr: "Eksik malzeme" },
    "above-target": { en: "Above target", tr: "Hedef üzeri" },
  };
  const k = kindLabel[alert.kind] ?? kindLabel.variance!;
  const label = locale === "tr" ? k.tr : k.en;
  return (
    <div className={`m-alert m-alert-${alert.severity}`}>
      <span className="m-alert-kind">{label}</span>
      <span className="m-alert-subject">{alert.subject || (locale === "tr" ? "Food cost hedefin üzerinde" : "Food cost above target")}</span>
      {alert.value !== null && <span className="m-alert-value">{alert.kind === "above-target" ? `+${pct(alert.value)}` : money(alert.value)}</span>}
    </div>
  );
}

export default async function MobileDashboard() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login?next=/m");

  const restaurantId = ctx.restaurant?.id ?? null;
  if (!restaurantId) {
    return (
      <div className="m-empty">
        <div className="m-logo">COSTERA</div>
        <p>{tx(locale, "No restaurant connected yet.", "Henüz bağlı restoran yok.")}</p>
        <Link href="/dashboard" className="m-link">{tx(locale, "Go to dashboard", "Dashboard'a git")}</Link>
      </div>
    );
  }

  const [input, source, expenseRecords] = await Promise.all([
    getRestaurantInput(restaurantId),
    getDataSource(restaurantId),
    getExpenses(restaurantId),
  ]);

  const overview = buildMobileOverview({
    restaurantId,
    locationId: null,
    input,
    source: source ? { kind: source.kind, provider: source.provider, syncedAt: source.syncedAt } : null,
    expenses: expenseRecords,
  });

  const kpis = overview.kpis;
  const hasData = kpis !== null;

  return (
    <>
      <header className="m-header">
        <div className="m-header-top">
          <span className="m-logo">COSTERA</span>
          <span className="m-badge">{tx(locale, "MONITOR", "İZLEME")}</span>
        </div>
        <h1 className="m-restaurant">{ctx.restaurant!.name}</h1>
        {overview.source && (
          <div className="m-source">
            <span className={`m-source-dot m-source-${overview.source.state}`} />
            <span>{overview.source.provider}</span>
            {overview.period && <span className="m-period">{overview.period.from} → {overview.period.to}</span>}
          </div>
        )}
      </header>

      {!hasData ? (
        <section className="m-empty-data">
          <p>{tx(locale, "No data connected yet. Import data or connect a source from the web dashboard.", "Henüz veri bağlanmamış. Web panelinden veri yükleyin veya bir kaynak bağlayın.")}</p>
          <Link href="/dashboard" className="m-link">{tx(locale, "Open dashboard", "Dashboard'u aç")}</Link>
        </section>
      ) : (
        <>
          <section className="m-kpis">
            <KpiCard label={tx(locale, "Net Sales", "Net Satış")} value={money(kpis.netSales)} sub={`${kpis.unitsSold.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${tx(locale, "units", "adet")}`} tone="good" />
            <KpiCard label="Food Cost" value={kpis.actualFoodCostPct !== null ? pct(kpis.actualFoodCostPct) : "—"} sub={`${tx(locale, "target", "hedef")} ${pct(kpis.targetFoodCostPct)}`} tone={kpis.actualFoodCostPct !== null && kpis.actualFoodCostPct > kpis.targetFoodCostPct ? "bad" : "good"} />
            <KpiCard label={tx(locale, "Unexplained", "Açıklanamayan")} value={kpis.unexplainedCost !== null ? money(kpis.unexplainedCost) : "—"} tone={kpis.unexplainedCost !== null && kpis.unexplainedCost > 0 ? "warn" : "good"} />
            {kpis.operatingExpenses !== null && (
              <KpiCard label={tx(locale, "Op. Expenses", "İşl. Gideri")} value={money(kpis.operatingExpenses)} />
            )}
            {kpis.netProfit !== null && (
              <KpiCard label={tx(locale, "Net Profit", "Net Kâr")} value={money(kpis.netProfit)} tone={kpis.netProfit >= 0 ? "good" : "bad"} />
            )}
          </section>

          {overview.channels.length > 0 && (
            <section className="m-section">
              <h2 className="m-section-title">{tx(locale, "Channels", "Kanallar")}</h2>
              <div className="m-channels">
                {overview.channels.map((ch) => (
                  <div className="m-channel" key={ch.name}>
                    <span className="m-channel-name">{ch.name}</span>
                    <span className="m-channel-sales">{money(ch.sales)}</span>
                    <i className="m-channel-bar"><em style={{ width: Math.max(6, (ch.sales / (overview.channels[0]?.sales || 1)) * 100) + "%" }} /></i>
                  </div>
                ))}
              </div>
            </section>
          )}

          {overview.alerts.length > 0 && (
            <section className="m-section">
              <h2 className="m-section-title">
                {tx(locale, "Alerts", "Uyarılar")}
                <span className="m-alert-count">{overview.alerts.length}</span>
              </h2>
              <div className="m-alerts">
                {overview.alerts.map((alert) => <AlertRow key={alert.id} alert={alert} locale={locale} />)}
              </div>
            </section>
          )}
        </>
      )}

      <footer className="m-footer">
        <span>{tx(locale, "View only · Data managed from web dashboard", "Salt okunur · Veri web panelinden yönetilir")}</span>
        <Link href="/dashboard" className="m-link">{tx(locale, "Open full dashboard", "Tam dashboard'u aç")}</Link>
      </footer>
    </>
  );
}
