import { COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";

export default async function ReportsPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;
  const hasData = !!input;

  const reports = [
    {
      title: tx(locale, "Daily Cost Pulse", "Günlük Maliyet Nabzı"),
      period: tx(locale, "Today", "Bugün"),
      desc: tx(locale, "Food cost, sales, variance", "Food cost, satış, fark"),
      type: "cost-summary",
      icon: "📊",
    },
    {
      title: tx(locale, "Weekly Leakage Review", "Haftalık Kaçak İncelemesi"),
      period: "Sep 16–22",
      desc: tx(locale, "Root causes & actions", "Kök nedenler & aksiyonlar"),
      type: "variance",
      icon: "⚠",
    },
    {
      title: tx(locale, "Monthly Management P&L", "Aylık Yönetim P&L"),
      period: tx(locale, "September", "Eylül"),
      desc: tx(locale, "Profitability summary", "Kârlılık özeti"),
      type: "pnl",
      icon: "💰",
    },
    {
      title: tx(locale, "Inventory Movement Report", "Stok Hareket Raporu"),
      period: tx(locale, "Current period", "Mevcut dönem"),
      desc: tx(locale, "Opening, purchases, usage, closing", "Açılış, satın alma, kullanım, kapanış"),
      type: "inventory",
      icon: "📦",
    },
  ];

  const statusLabel = hasData
    ? tx(locale, "Ready", "Hazır")
    : tx(locale, "No data", "Veri yok");

  return (
    <COSTERAAppShell active="/dashboard/reports" locale={locale} title={tx(locale, "Reports", "Raporlar")}>
      <section className="costera-grid">
        <article className="costera-panel span-3">
          <div className="costera-panel-head">
            <div>
              <span>{tx(locale, "REPORT LIBRARY", "RAPOR KÜTÜPHANESİ")}</span>
              <h2>{tx(locale, "Management reports", "Yönetim raporları")}</h2>
            </div>
          </div>
          <div className="costera-report-grid">
            {reports.map((r) => (
              <div className="costera-report-card" key={r.type}>
                <span>{r.icon}</span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
                <div>
                  <small>{r.period}</small>
                  <StatusPill tone={hasData ? "good" : "neutral"}>
                    {statusLabel}
                  </StatusPill>
                </div>
                {hasData && (
                  <a
                    href={`/api/reports/export?type=${r.type}`}
                    download
                    className="costera-report-download"
                  >
                    ↓ {tx(locale, "Download CSV", "CSV İndir")}
                  </a>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>
    </COSTERAAppShell>
  );
}
