import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import { money } from "@/lib/format";

export default async function InventoryPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;

  if (!input) {
    return (
      <COSTERAAppShell active="/dashboard/inventory" locale={locale} title={tx(locale, "Inventory", "Stok")} eyebrow={tx(locale, "NO LIVE SOURCE", "CANLI VERİ KAYNAĞI YOK")}>
        <div className="costera-metrics five">
          <AppMetric label={tx(locale, "Stock Value", "Stok Değeri")} value="$0" meta={tx(locale, "No connected source", "Bağlı veri kaynağı yok")} />
          <AppMetric label={tx(locale, "Unexplained Value", "Açıklanamayan Tutar")} value="$0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Critical Items", "Kritik Kalemler")} value="0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Tracked Items", "Takip Edilen Kalem")} value="0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Period", "Dönem")} value="—" meta={tx(locale, "No data period", "Veri dönemi yok")} tone="gold" />
        </div>
        <EmptyWorkspace
          locale={locale}
          title={tx(locale, "Inventory is waiting for a data source.", "Stok bir veri kaynağı bekliyor.")}
          text={tx(locale, "Connect the Universal POS Demo or import files. COSTERA will calculate stock value, usage and unexplained variance per ingredient.", "Universal POS Demo'yu bağlayın veya dosya içe aktarın. COSTERA malzeme bazında stok değeri, kullanım ve açıklanamayan farkı hesaplar.")}
        />
      </COSTERAAppShell>
    );
  }

  const analysis = analyzeCost(input);
  const unitCostByIng = new Map(input.ingredients.map((i) => [i.id, i.unitCost]));
  const closingByIng = new Map(input.inventory.map((v) => [v.ingredientId, v.closingQty]));

  const stockValue = input.inventory.reduce(
    (sum, v) => sum + v.closingQty * (unitCostByIng.get(v.ingredientId) || 0),
    0,
  );
  const criticalCount = analysis.ingredientVariance.filter((r) => r.risk === "High").length;
  const rows = analysis.ingredientVariance;
  const health = analysis.ingredientVariance.filter((r) => r.unexplainedValue > 0).slice(0, 3);
  const withinRange = analysis.ingredientVariance.length - health.length;

  return (
    <COSTERAAppShell active="/dashboard/inventory" locale={locale} title={tx(locale, "Inventory", "Stok")} eyebrow={tx(locale, "LIVE STOCK POSITION", "CANLI STOK DURUMU")}>
      <div className="costera-metrics five">
        <AppMetric label={tx(locale, "Stock Value", "Stok Değeri")} value={money(stockValue)} meta={tx(locale, "Closing stock at unit cost", "Kapanış stoku, birim maliyetle")} />
        <AppMetric label={tx(locale, "Unexplained Value", "Açıklanamayan Tutar")} value={money(analysis.totals.unexplainedCost)} meta={tx(locale, "Across all ingredients", "Tüm malzemelerde")} tone="bad" />
        <AppMetric label={tx(locale, "Critical Items", "Kritik Kalemler")} value={String(criticalCount)} meta={tx(locale, "High-risk variance", "Yüksek riskli fark")} tone={criticalCount > 0 ? "bad" : "good"} />
        <AppMetric label={tx(locale, "Tracked Items", "Takip Edilen Kalem")} value={String(input.ingredients.length)} meta={tx(locale, "Ingredients in model", "Modeldeki malzemeler")} />
        <AppMetric label={tx(locale, "Period", "Dönem")} value={input.period.to.slice(5)} meta={input.period.from + " → " + input.period.to} tone="gold" />
      </div>

      <section className="costera-grid inventory-layout">
        <article className="costera-panel span-2">
          <div className="costera-panel-head"><div><span>{tx(locale, "INVENTORY POSITION", "STOK DURUMU")}</span><h2>{tx(locale, "Current stock & variance", "Mevcut stok & fark")}</h2></div></div>
          <div className="costera-table">
            <div className="costera-table-row head"><span>{tx(locale, "Ingredient", "Malzeme")}</span><span>{tx(locale, "Closing", "Kapanış")}</span><span>{tx(locale, "Unit cost", "Birim maliyet")}</span><span>{tx(locale, "Value", "Değer")}</span><span>{tx(locale, "Variance", "Fark")}</span><span>{tx(locale, "Status", "Durum")}</span></div>
            {rows.map((r) => {
              const closing = closingByIng.get(r.ingredientId) ?? 0;
              const value = closing * r.unitCost;
              const critical = r.risk === "High" || r.risk === "Medium";
              return (
                <div className="costera-table-row" key={r.ingredientId}>
                  <span><b>{r.ingredient}</b></span>
                  <span>{closing} {r.unit}</span>
                  <span>${r.unitCost.toFixed(2)}</span>
                  <span>{money(value)}</span>
                  <span className={r.unexplainedQty > 0 ? "negative" : ""}>{r.unexplainedQty > 0 ? "+" : ""}{r.unexplainedQty} {r.unit}</span>
                  <span><StatusPill tone={critical ? "bad" : "good"}>{critical ? tx(locale, "Review", "İncele") : tx(locale, "Normal", "Normal")}</StatusPill></span>
                </div>
              );
            })}
          </div>
        </article>
        <article className="costera-panel">
          <div className="costera-panel-head"><div><span>{tx(locale, "STOCK HEALTH", "STOK SAĞLIĞI")}</span><h2>{tx(locale, "What needs attention", "İncelenmesi gerekenler")}</h2></div></div>
          <div className="costera-action-list">
            {health.map((r) => (
              <div key={r.ingredientId}>
                <i className="red">!</i>
                <p><strong>{r.ingredient}</strong><span>{r.unexplainedQty} {r.unit} {tx(locale, "unexplained usage", "açıklanamayan kullanım")}</span></p>
                <b>{money(r.unexplainedValue)}</b>
              </div>
            ))}
            {withinRange > 0 && (
              <div>
                <i className="green">✓</i>
                <p><strong>{withinRange} {tx(locale, "items", "kalem")}</strong><span>{tx(locale, "Within expected range", "Beklenen aralıkta")}</span></p>
              </div>
            )}
          </div>
        </article>
      </section>
    </COSTERAAppShell>
  );
}
