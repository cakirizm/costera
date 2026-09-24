import { AppMetric, COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import { money } from "@/lib/format";

export default async function PurchasingPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;

  if (!input) {
    return (
      <COSTERAAppShell active="/dashboard/purchasing" locale={locale} title={tx(locale, "Purchasing", "Satın Alma")} eyebrow={tx(locale, "NO LIVE SOURCE", "CANLI VERİ KAYNAĞI YOK")}>
        <div className="costera-metrics four">
          <AppMetric label={tx(locale, "Total Purchases", "Toplam Satın Alma")} value="$0" meta={tx(locale, "No connected source", "Bağlı veri kaynağı yok")} />
          <AppMetric label={tx(locale, "Ingredients Purchased", "Satın Alınan Malzeme")} value="0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Highest Spend", "En Yüksek Harcama")} value="—" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} tone="gold" />
          <AppMetric label={tx(locale, "Period", "Dönem")} value="—" meta={tx(locale, "No data period", "Veri dönemi yok")} />
        </div>
        <EmptyWorkspace
          locale={locale}
          title={tx(locale, "Purchasing is waiting for a data source.", "Satın Alma bir veri kaynağı bekliyor.")}
          text={tx(locale, "Connect a source or import files. COSTERA summarizes purchases per ingredient and their cost impact.", "Bir kaynak bağlayın veya dosya içe aktarın. COSTERA malzeme bazında satın almayı ve maliyet etkisini özetler.")}
        />
      </COSTERAAppShell>
    );
  }

  const unitCostByIng = new Map(input.ingredients.map((i) => [i.id, { name: i.name, unit: i.unit, unitCost: i.unitCost }]));
  const rows = input.inventory
    .filter((v) => v.purchasesQty > 0)
    .map((v) => {
      const ing = unitCostByIng.get(v.ingredientId);
      return {
        id: v.ingredientId,
        name: ing?.name ?? v.ingredientId,
        unit: ing?.unit ?? "",
        qty: v.purchasesQty,
        unitCost: ing?.unitCost ?? 0,
        value: v.purchasesQty * (ing?.unitCost ?? 0),
      };
    })
    .sort((a, b) => b.value - a.value);

  const currency = ctx?.restaurant?.currency ?? "USD";
  const totalPurchases = rows.reduce((s, r) => s + r.value, 0);
  const highest = rows[0];

  return (
    <COSTERAAppShell active="/dashboard/purchasing" locale={locale} title={tx(locale, "Purchasing", "Satın Alma")} eyebrow={tx(locale, "LIVE PURCHASE SUMMARY", "CANLI SATIN ALMA ÖZETİ")}>
      <div className="costera-metrics four">
        <AppMetric label={tx(locale, "Total Purchases", "Toplam Satın Alma")} value={money(totalPurchases, currency)} meta={tx(locale, "Purchased qty at unit cost", "Satın alınan miktar, birim maliyetle")} />
        <AppMetric label={tx(locale, "Ingredients Purchased", "Satın Alınan Malzeme")} value={String(rows.length)} meta={tx(locale, "With purchase movement", "Satın alma hareketi olan")} />
        <AppMetric label={tx(locale, "Highest Spend", "En Yüksek Harcama")} value={highest ? money(highest.value, currency) : "—"} meta={highest ? highest.name : tx(locale, "No purchases", "Satın alma yok")} tone="gold" />
        <AppMetric label={tx(locale, "Period", "Dönem")} value={input.period.to.slice(5)} meta={input.period.from + " → " + input.period.to} />
      </div>
      <section className="costera-grid purchasing-grid">
        <article className="costera-panel span-3">
          <div className="costera-panel-head"><div><span>{tx(locale, "PURCHASE SUMMARY", "SATIN ALMA ÖZETİ")}</span><h2>{tx(locale, "Purchases by ingredient", "Malzeme bazında satın alma")}</h2></div></div>
          <div className="costera-table">
            <div className="costera-table-row head"><span>{tx(locale, "Ingredient", "Malzeme")}</span><span>{tx(locale, "Purchased", "Satın Alınan")}</span><span>{tx(locale, "Unit cost", "Birim maliyet")}</span><span>{tx(locale, "Value", "Değer")}</span></div>
            {rows.map((r) => (
              <div className="costera-table-row" key={r.id}>
                <span><b>{r.name}</b></span>
                <span>{r.qty} {r.unit}</span>
                <span>${r.unitCost.toFixed(2)}</span>
                <span>{money(r.value, currency)}</span>
              </div>
            ))}
          </div>
          <div className="costera-engine-foot">{tx(locale, "Supplier-level price tracking and increase alerts require a purchasing/accounting feed — available once that source is connected.", "Tedarikçi bazlı fiyat takibi ve artış uyarıları bir satın alma/muhasebe akışı gerektirir — o kaynak bağlandığında kullanılabilir.")}</div>
        </article>
      </section>
    </COSTERAAppShell>
  );
}
