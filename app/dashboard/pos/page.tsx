import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";
import { getAppLocale, tx } from "@/lib/costera/i18n";

const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

export default async function POSPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;

  if (!input) {
    return (
      <COSTERAAppShell active="/dashboard/pos" locale={locale} title={tx(locale, "Sales & POS", "Satış & POS")} eyebrow={tx(locale, "NO LIVE SOURCE", "CANLI VERİ KAYNAĞI YOK")}>
        <div className="costera-metrics four">
          <AppMetric label={tx(locale, "Orders", "Siparişler")} value="0" meta={tx(locale, "No connected source", "Bağlı veri kaynağı yok")} tone="good" />
          <AppMetric label={tx(locale, "Net Sales", "Net Satış")} value="$0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Mapped Items", "Eşleşen Ürünler")} value="—" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} tone="gold" />
          <AppMetric label={tx(locale, "Channels", "Kanallar")} value="0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
        </div>
        <EmptyWorkspace
          locale={locale}
          title={tx(locale, "Sales & POS is waiting for a data source.", "Satış & POS bir veri kaynağı bekliyor.")}
          text={tx(locale, "Connect a source or import files. COSTERA will break sales down by channel and check menu-item mapping completeness.", "Bir kaynak bağlayın veya dosya içe aktarın. COSTERA satışları kanal bazında ayırır ve menü eşleştirme bütünlüğünü kontrol eder.")}
        />
      </COSTERAAppShell>
    );
  }

  const analysis = analyzeCost(input);
  const priceById = new Map(input.menuItems.map((m) => [m.id, m.sellingPrice]));
  const knownItem = new Set(input.menuItems.map((m) => m.id));

  type Row = { channel: string; orders: number; sales: number; mapped: number; total: number };
  const byChannel = new Map<string, Row>();
  for (const sale of input.sales) {
    const row = byChannel.get(sale.channel) || { channel: sale.channel, orders: 0, sales: 0, mapped: 0, total: 0 };
    row.orders += sale.quantity;
    row.sales += sale.netSales ?? sale.quantity * (priceById.get(sale.menuItemId) || 0);
    row.total += 1;
    if (knownItem.has(sale.menuItemId)) row.mapped += 1;
    byChannel.set(sale.channel, row);
  }
  const rows = [...byChannel.values()].sort((a, b) => b.sales - a.sales);
  const totalOrders = rows.reduce((s, r) => s + r.orders, 0);
  const mappedPct = analysis.dataQuality.salesCount > 0
    ? Math.round((analysis.dataQuality.mappedSalesCount / analysis.dataQuality.salesCount) * 100)
    : 0;

  return (
    <COSTERAAppShell active="/dashboard/pos" locale={locale} title={tx(locale, "Sales & POS", "Satış & POS")} eyebrow={tx(locale, "LIVE SALES FEED", "CANLI SATIŞ AKIŞI")}>
      <div className="costera-metrics four">
        <AppMetric label={tx(locale, "Orders", "Siparişler")} value={totalOrders.toLocaleString("en-US")} meta={tx(locale, "Units sold in period", "Dönemde satılan adet")} tone="good" />
        <AppMetric label={tx(locale, "Net Sales", "Net Satış")} value={money(analysis.totals.netSales)} meta={tx(locale, "Across all channels", "Tüm kanallar")} />
        <AppMetric label={tx(locale, "Mapped Items", "Eşleşen Ürünler")} value={mappedPct + "%"} meta={analysis.dataQuality.missingMenuItems.length + " " + tx(locale, "items need mapping", "ürün eşleştirme bekliyor")} tone={mappedPct === 100 ? "good" : "gold"} />
        <AppMetric label={tx(locale, "Channels", "Kanallar")} value={String(rows.length)} meta={tx(locale, "Discovered from sales", "Satıştan keşfedildi")} />
      </div>
      <section className="costera-grid pos-grid">
        <article className="costera-panel span-3">
          <div className="costera-panel-head"><div><span>{tx(locale, "SALES FEED", "SATIŞ AKIŞI")}</span><h2>{tx(locale, "Channel mapping & completeness", "Kanal eşleştirme & veri bütünlüğü")}</h2></div></div>
          <div className="costera-table">
            <div className="costera-table-row head"><span>{tx(locale, "Channel", "Kanal")}</span><span>{tx(locale, "Orders", "Siparişler")}</span><span>{tx(locale, "Sales", "Satış")}</span><span>{tx(locale, "Mapping", "Eşleştirme")}</span><span>{tx(locale, "Status", "Durum")}</span></div>
            {rows.map((r) => {
              const pct = r.total > 0 ? Math.round((r.mapped / r.total) * 100) : 0;
              const fullyMapped = pct === 100;
              return (
                <div className="costera-table-row" key={r.channel}>
                  <span><b>{r.channel}</b></span>
                  <span>{r.orders.toLocaleString("en-US")}</span>
                  <span>{money(r.sales)}</span>
                  <span>{pct}%</span>
                  <span><StatusPill tone={fullyMapped ? "good" : "warning"}>{fullyMapped ? tx(locale, "Mapped", "Eşleşti") : tx(locale, "Check mapping", "Eşleştirmeyi kontrol et")}</StatusPill></span>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </COSTERAAppShell>
  );
}
