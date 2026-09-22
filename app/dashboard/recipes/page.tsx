import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function RecipesPage() {
  const locale = await getAppLocale();
  const ctx = await getSessionContext();
  const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;

  if (!input) {
    return (
      <COSTERAAppShell active="/dashboard/recipes" locale={locale} title={tx(locale, "Recipes & Food Cost", "Reçeteler & Food Cost")} eyebrow={tx(locale, "NO LIVE SOURCE", "CANLI VERİ KAYNAĞI YOK")}>
        <div className="costera-metrics five">
          <AppMetric label={tx(locale, "Menu Items", "Menü Ürünleri")} value="0" meta={tx(locale, "No connected source", "Bağlı veri kaynağı yok")} />
          <AppMetric label={tx(locale, "Missing Recipes", "Eksik Reçeteler")} value="0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Target Food Cost", "Hedef Food Cost")} value="25.0%" meta={tx(locale, "Group target", "Grup hedefi")} tone="gold" />
          <AppMetric label={tx(locale, "Weighted Actual", "Ağırlıklı Gerçek")} value="—" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} />
          <AppMetric label={tx(locale, "Tracked Items", "Takip Edilen Ürün")} value="0" meta={tx(locale, "Waiting for data", "Veri bekleniyor")} tone="gold" />
        </div>
        <EmptyWorkspace
          locale={locale}
          title={tx(locale, "Recipes are waiting for a data source.", "Reçeteler bir veri kaynağı bekliyor.")}
          text={tx(locale, "Connect a source or import files. COSTERA will calculate recipe cost and food-cost percentage for every menu item.", "Bir kaynak bağlayın veya dosya içe aktarın. COSTERA her menü ürünü için reçete maliyeti ve food cost yüzdesini hesaplar.")}
        />
      </COSTERAAppShell>
    );
  }

  const analysis = analyzeCost(input);
  const unitCostByIng = new Map(input.ingredients.map((i) => [i.id, i.unitCost]));

  const recipeRows = input.menuItems.map((m) => {
    const recipeCost = m.recipe.reduce((s, line) => s + line.quantity * (unitCostByIng.get(line.ingredientId) || 0), 0);
    const actualFc = m.sellingPrice > 0 ? (recipeCost / m.sellingPrice) * 100 : 0;
    const gap = actualFc - input.targetFoodCostPct;
    const status = m.recipe.length === 0 ? "missing" : gap > 2 ? "above" : gap > 0 ? "watch" : "healthy";
    return { id: m.id, name: m.name, recipeCost, actualFc, gap, status };
  });

  const missingCount = input.menuItems.filter((m) => m.recipe.length === 0).length;
  const opportunities = [...recipeRows].filter((r) => r.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 3);

  const statusLabel = (s: string) =>
    s === "healthy" ? tx(locale, "Healthy", "Sağlıklı")
      : s === "watch" ? tx(locale, "Watch", "İzle")
      : s === "missing" ? tx(locale, "No recipe", "Reçete yok")
      : tx(locale, "Above target", "Hedef üstü");
  const statusTone = (s: string) => (s === "healthy" ? "good" : s === "watch" ? "warning" : "bad");

  return (
    <COSTERAAppShell active="/dashboard/recipes" locale={locale} title={tx(locale, "Recipes & Food Cost", "Reçeteler & Food Cost")} eyebrow={tx(locale, "LIVE MENU COSTING", "CANLI MENÜ MALİYETİ")}>
      <div className="costera-metrics five">
        <AppMetric label={tx(locale, "Menu Items", "Menü Ürünleri")} value={String(input.menuItems.length)} meta={tx(locale, "In the operating model", "Operasyon modelinde")} />
        <AppMetric label={tx(locale, "Missing Recipes", "Eksik Reçeteler")} value={String(missingCount)} meta={missingCount > 0 ? tx(locale, "Needs mapping", "Eşleştirme gerekli") : tx(locale, "All mapped", "Hepsi eşleşti")} tone={missingCount > 0 ? "bad" : "good"} />
        <AppMetric label={tx(locale, "Target Food Cost", "Hedef Food Cost")} value={input.targetFoodCostPct.toFixed(1) + "%"} meta={tx(locale, "Group target", "Grup hedefi")} tone="gold" />
        <AppMetric label={tx(locale, "Weighted Actual", "Ağırlıklı Gerçek")} value={analysis.totals.theoreticalFoodCostPct.toFixed(1) + "%"} meta={(analysis.totals.theoreticalFoodCostPct - input.targetFoodCostPct >= 0 ? "+" : "") + (analysis.totals.theoreticalFoodCostPct - input.targetFoodCostPct).toFixed(1) + " pp " + tx(locale, "vs target", "hedefe göre")} tone={analysis.totals.theoreticalFoodCostPct > input.targetFoodCostPct ? "bad" : "good"} />
        <AppMetric label={tx(locale, "Tracked Items", "Takip Edilen Ürün")} value={String(recipeRows.length)} meta={tx(locale, "Costed recipes", "Maliyeti çıkan reçete")} tone="gold" />
      </div>
      <section className="costera-grid recipes-layout">
        <article className="costera-panel span-2">
          <div className="costera-panel-head"><div><span>{tx(locale, "MENU COSTING", "MENÜ MALİYETİ")}</span><h2>{tx(locale, "Recipe performance", "Reçete performansı")}</h2></div></div>
          <div className="costera-table recipe-table">
            <div className="costera-table-row head"><span>{tx(locale, "Menu item", "Menü ürünü")}</span><span>{tx(locale, "Recipe cost", "Reçete maliyeti")}</span><span>{tx(locale, "Target FC", "Hedef FC")}</span><span>{tx(locale, "Actual FC", "Gerçek FC")}</span><span>{tx(locale, "Variance", "Fark")}</span><span>{tx(locale, "Status", "Durum")}</span></div>
            {recipeRows.map((r) => (
              <div className="costera-table-row" key={r.id}>
                <span><b>{r.name}</b></span>
                <span>${r.recipeCost.toFixed(2)}</span>
                <span>{input.targetFoodCostPct.toFixed(1)}%</span>
                <span>{r.actualFc.toFixed(1)}%</span>
                <span className={r.gap > 0 ? "negative" : ""}>{r.gap > 0 ? "+" : ""}{r.gap.toFixed(1)} pp</span>
                <span><StatusPill tone={statusTone(r.status)}>{statusLabel(r.status)}</StatusPill></span>
              </div>
            ))}
          </div>
        </article>
        <article className="costera-panel">
          <div className="costera-panel-head"><div><span>{tx(locale, "SMART ACTIONS", "AKILLI AKSİYONLAR")}</span><h2>{tx(locale, "Margin opportunities", "Marj fırsatları")}</h2></div></div>
          <div className="costera-recommendations">
            {opportunities.map((r, i) => (
              <div key={r.id}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <p><strong>{r.name}</strong><span>{tx(locale, "Food cost", "Food cost")} {r.actualFc.toFixed(1)}% — {r.gap.toFixed(1)} pp {tx(locale, "above target; review portioning or price.", "hedef üstü; porsiyon veya fiyatı gözden geçirin.")}</span></p>
              </div>
            ))}
            {missingCount > 0 && (
              <div>
                <b>{String(opportunities.length + 1).padStart(2, "0")}</b>
                <p><strong>{missingCount} {tx(locale, "products", "ürün")}</strong><span>{tx(locale, "Sales exist but recipe mapping is missing.", "Satış var ancak reçete eşleştirmesi eksik.")}</span></p>
              </div>
            )}
          </div>
        </article>
      </section>
    </COSTERAAppShell>
  );
}
