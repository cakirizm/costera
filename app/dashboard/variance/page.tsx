import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import { money, qty } from "@/lib/format";

export default async function VariancePage(){
 const locale = await getAppLocale();
 const ctx = await getSessionContext();
 const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;
 const tr = locale === "tr";

 if (!input) {
   return (
    <COSTERAAppShell active="/dashboard/variance" locale={locale} title={tx(locale,"Cost Control","Maliyet Kontrolü")} eyebrow={tx(locale,"NO LIVE SOURCE","CANLI VERİ KAYNAĞI YOK")}>
      <div className="costera-metrics four">
        <AppMetric label={tx(locale,"Target Food Cost","Hedef Food Cost")} value="25.0%" meta={tx(locale,"Configured target","Tanımlı hedef")} tone="gold" />
        <AppMetric label={tx(locale,"Actual Food Cost","Gerçek Food Cost")} value="—" meta={tx(locale,"Waiting for live data","Canlı veri bekleniyor")} />
        <AppMetric label={tx(locale,"Approved Waste","Onaylı Fire")} value="$0" meta={tx(locale,"Waiting for live data","Canlı veri bekleniyor")} />
        <AppMetric label={tx(locale,"Unexplained","Açıklanamayan")} value="$0" meta={tx(locale,"Waiting for live data","Canlı veri bekleniyor")} />
      </div>
      <EmptyWorkspace
        locale={locale}
        title={tx(locale,"Cost Control is waiting for a data source.","Maliyet Kontrolü bir veri kaynağı bekliyor.")}
        text={tx(locale,"Connect the Universal POS Demo or any real POS source. COSTERA will then calculate Expected → Actual → Approved Waste → Unexplained automatically.","Universal POS Demo'yu veya gerçek bir POS kaynağını bağlayın. COSTERA Beklenen → Gerçek → Onaylı Fire → Açıklanamayan farkı otomatik hesaplar.")}
      />
    </COSTERAAppShell>
   );
 }

 const analysis = analyzeCost(input);
 const t = analysis.totals;
 const top = analysis.ingredientVariance.slice(0, 5);
 const focus = top[0];

 const riskText=(risk:string)=>risk==="High"?tx(locale,"High","Yüksek"):risk==="Medium"?tx(locale,"Medium","Orta"):tx(locale,"Low","Düşük");
 const confidence=(c:string)=>c==="High"?tx(locale,"High","Yüksek"):c==="Medium"?tx(locale,"Medium","Orta"):tx(locale,"Low","Düşük");
 const cause=(label:string)=>{
   const m:Record<string,string>={
    "Missing recipe / mapping":"Eksik reçete / eşleştirme",
    "Count timing / transfer mismatch":"Sayım zamanı / transfer uyumsuzluğu",
    "Portioning, unrecorded waste or stock-count issue":"Porsiyon, kayıtsız fire veya stok sayımı sorunu",
    "Excess usage beyond approved waste":"Onaylı firenin üzerinde tüketim",
    "Small unexplained usage":"Küçük açıklanamayan tüketim",
    "Within expected range":"Beklenen aralıkta"
   };
   return tx(locale, label, m[label] || label);
 };
 const reason=(r:string)=> {
   if(!tr) return tx(locale, r, r);
   const map:Record<string,string>={
    "Inventory usage exists but COSTERA has no theoretical recipe consumption for this ingredient.":"Stok tüketimi var ancak COSTERA'da bu malzeme için teorik reçete tüketimi bulunmuyor.",
    "Recorded stock usage is lower than recipe-driven theoretical usage.":"Kayıtlı stok tüketimi reçete bazlı teorik tüketimin altında.",
    "Actual usage materially exceeds theoretical usage and no approved waste explains the difference.":"Gerçek tüketim teorik tüketimi belirgin şekilde aşıyor ve onaylı fire farkı açıklamıyor.",
    "Approved waste exists, but a material unexplained balance still remains after removing it.":"Onaylı fire var ancak düşüldükten sonra önemli bir açıklanamayan fark kalıyor.",
    "Actual usage is above theoretical usage, but the variance is not large enough to isolate a cause from aggregate data alone.":"Gerçek tüketim teorik tüketimin üzerinde ancak yalnızca toplu veriden kesin neden çıkarmak için fark yeterince büyük değil.",
    "Actual usage is aligned with theoretical usage after approved waste.":"Onaylı fire sonrası gerçek tüketim teorik tüketimle uyumlu."
   };
   return map[r] || r;
 };
 const action=(a:string)=>{
   if(!tr) return tx(locale, a, a);
   const map:Record<string,string>={
    "Check recipe mapping and confirm that every sold menu item using this ingredient is linked.":"Reçete eşleştirmesini kontrol edin ve bu malzemeyi kullanan tüm satılmış ürünlerin bağlı olduğunu doğrulayın.",
    "Review stock count timing, transfers, purchase receipts and recipe quantity assumptions.":"Stok sayım zamanını, transferleri, mal kabullerini ve reçete miktar varsayımlarını kontrol edin.",
    "Perform a physical count, review portioning standards and check whether waste was recorded.":"Fiziksel sayım yapın, porsiyon standartlarını inceleyin ve fire kaydı olup olmadığını kontrol edin.",
    "Review receiving, transfers, portion sizes and kitchen handling for this ingredient.":"Bu malzeme için mal kabul, transfer, porsiyon miktarı ve mutfak kullanımını inceleyin.",
    "Monitor the next count cycle and compare by shift, branch and menu item when detailed feeds are available.":"Bir sonraki sayım döngüsünü izleyin; detay veri geldiğinde vardiya, şube ve ürün bazında karşılaştırın.",
    "No immediate action required.":"Acil aksiyon gerekmiyor."
   };
   return map[a] || a;
 };

 return (
  <COSTERAAppShell active="/dashboard/variance" locale={locale} title={tx(locale,"Cost Control","Maliyet Kontrolü")} eyebrow={tx(locale,"UNIVERSAL POS DEMO · CONNECTED","UNIVERSAL POS DEMO · BAĞLI")}>
   <div className="control-hero-v2">
    <div className="control-hero-copy">
      <span>{tx(locale,"UNEXPLAINED COST THIS PERIOD","BU DÖNEM AÇIKLANAMAYAN MALİYET")}</span>
      <strong>{money(t.unexplainedCost)}</strong>
      <small>{((t.unexplainedCost / t.netSales) * 100).toFixed(1)}% {tx(locale,"of net sales · after approved waste is removed","net satışın · onaylı fire düşüldükten sonra")}</small>
    </div>
    <div className="control-equation-v2">
      <div><small>{tx(locale,"Expected usage","Beklenen kullanım")}</small><b>{money(t.theoreticalCost)}</b><span>{tx(locale,"Recipe driven","Reçete bazlı")}</span></div><i>→</i>
      <div><small>{tx(locale,"Actual usage","Gerçek kullanım")}</small><b>{money(t.actualCost)}</b><span>{tx(locale,"Inventory movement","Stok hareketi")}</span></div><i>−</i>
      <div><small>{tx(locale,"Approved waste","Onaylı fire")}</small><b>{money(t.knownWasteCost)}</b><span>{tx(locale,"Explained loss","Açıklanmış kayıp")}</span></div><i>=</i>
      <div className="danger"><small>{tx(locale,"Unexplained","Açıklanamayan")}</small><b>{money(t.unexplainedCost)}</b><span>{tx(locale,"Needs action","Aksiyon gerekli")}</span></div>
    </div>
   </div>

   <div className="costera-metrics four">
    <AppMetric label={tx(locale,"Target Food Cost","Hedef Food Cost")} value={t.targetFoodCostPct.toFixed(1) + "%"} meta={tx(locale,"Configured target","Tanımlı hedef")} tone="gold" />
    <AppMetric label={tx(locale,"Actual Food Cost","Gerçek Food Cost")} value={t.actualFoodCostPct.toFixed(1) + "%"} meta={(t.targetGapPp >= 0 ? "+" : "") + t.targetGapPp.toFixed(1) + " pp " + tx(locale,"vs target","hedefe göre")} tone={t.targetGapPp > 0 ? "bad" : "good"} />
    <AppMetric label={tx(locale,"Approved Waste","Onaylı Fire")} value={money(t.knownWasteCost)} meta={tx(locale,"Known & explained","Bilinen & açıklanmış")} />
    <AppMetric label={tx(locale,"Unexplained","Açıklanamayan")} value={money(t.unexplainedCost)} meta={tx(locale,"Remaining leakage","Kalan kaçak")} tone="bad" />
   </div>

   {focus && (
    <section className="control-focus-card">
      <div className="control-focus-head">
        <div><span>{tx(locale,"TOP PRIORITY","EN YÜKSEK ÖNCELİK")}</span><h2>{focus.ingredient}</h2><p>{focus.shareOfGapPct}% {tx(locale,"of the current positive unexplained cost","mevcut pozitif açıklanamayan maliyetin")}</p></div>
        <StatusPill tone={focus.risk==="High"?"bad":focus.risk==="Medium"?"warning":"good"}>{riskText(focus.risk)} {tx(locale,"Risk","Risk")}</StatusPill>
      </div>

      <div className="control-flow-row">
        <div><small>{tx(locale,"EXPECTED","BEKLENEN")}</small><strong>{focus.theoreticalQty} {focus.unit}</strong><span>{tx(locale,"Recipe-driven usage","Reçete bazlı kullanım")}</span></div><i>→</i>
        <div><small>{tx(locale,"ACTUAL","GERÇEK")}</small><strong>{focus.actualUsageQty} {focus.unit}</strong><span>{tx(locale,"Stock-derived usage","Stok bazlı kullanım")}</span></div><i>−</i>
        <div><small>{tx(locale,"WASTE","FİRE")}</small><strong>{focus.knownWasteQty} {focus.unit}</strong><span>{tx(locale,"Approved / explained","Onaylı / açıklanmış")}</span></div><i>=</i>
        <div className="danger"><small>{tx(locale,"UNEXPLAINED","AÇIKLANAMAYAN")}</small><strong>{qty(focus.unexplainedQty, focus.unit)}</strong><span>{money(focus.unexplainedValue)} {tx(locale,"impact","etki")}</span></div>
      </div>

      <div className="control-intelligence">
        <div className="control-cause">
          <span>{tx(locale,"POSSIBLE CAUSE","OLASI NEDEN")}</span><h3>{cause(focus.rootCause.label)}</h3><p>{reason(focus.rootCause.reason)}</p>
          <b className={"confidence " + focus.rootCause.confidence.toLowerCase()}>{confidence(focus.rootCause.confidence)} {tx(locale,"confidence","güven")}</b>
        </div>
        <div className="control-action">
          <span>{tx(locale,"RECOMMENDED ACTION","ÖNERİLEN AKSİYON")}</span><h3>{tx(locale,"What to do next","Sırada ne yapılmalı")}</h3><p>{action(focus.rootCause.action)}</p><button>{tx(locale,"Mark for review","İncelemeye işaretle")}</button>
        </div>
      </div>
    </section>
   )}

   <section className="costera-grid control-layout">
    <article className="costera-panel span-2">
     <div className="costera-panel-head"><div><span>{tx(locale,"VARIANCE EXPLORER","FARK ANALİZİ")}</span><h2>{tx(locale,"Expected → Actual → Waste → Unexplained","Beklenen → Gerçek → Fire → Açıklanamayan")}</h2></div><a href="/dashboard/integrations">{tx(locale,"Manage source","Kaynağı yönet")}</a></div>
     <div className="control-table-v3">
      <div className="head"><span>{tx(locale,"Ingredient","Malzeme")}</span><span>{tx(locale,"Expected","Beklenen")}</span><span>{tx(locale,"Actual","Gerçek")}</span><span>{tx(locale,"Waste","Fire")}</span><span>{tx(locale,"Unexplained","Açıklanamayan")}</span><span>{tx(locale,"Impact","Etki")}</span><span>{tx(locale,"Cause","Neden")}</span></div>
      {top.map((r)=><div className="row" key={r.ingredientId}>
       <span><b>{r.ingredient}</b><small>{riskText(r.risk)} {tx(locale,"risk","risk")} · {r.shareOfGapPct}% {tx(locale,"share","pay")}</small></span>
       <span>{r.theoreticalQty} {r.unit}</span><span>{r.actualUsageQty} {r.unit}</span><span>{r.knownWasteQty} {r.unit}</span>
       <span className={r.unexplainedQty > 0 ? "negative" : "positive"}>{qty(r.unexplainedQty, r.unit)}</span>
       <span className={r.unexplainedValue > 0 ? "negative" : "positive"}>{money(r.unexplainedValue)}</span>
       <span><b className="cause-label">{cause(r.rootCause.label)}</b><small>{confidence(r.rootCause.confidence)} {tx(locale,"confidence","güven")}</small></span>
      </div>)}
     </div>
    </article>

    <article className="costera-panel">
      <div className="costera-panel-head"><div><span>{tx(locale,"ACTION QUEUE","AKSİYON KUYRUĞU")}</span><h2>{tx(locale,"What management should review","Yönetimin incelemesi gerekenler")}</h2></div></div>
      <div className="control-action-list">
        {top.slice(0,4).map((r,i)=><div key={r.ingredientId}><b>{String(i+1).padStart(2,"0")}</b><p><strong>{r.ingredient}</strong><span>{action(r.rootCause.action)}</span></p><em>{money(r.unexplainedValue)}</em></div>)}
      </div>
    </article>
   </section>

   <div className="costera-engine-foot">{tx(locale,"The demo uses the same COSTERA calculation engine as future POS and delivery connectors. Disconnect the demo source from Integrations to return this page to zero data.","Demo, gelecekteki POS ve delivery connector'larıyla aynı COSTERA hesap motorunu kullanır. Bu ekranı tekrar sıfırlamak için Entegrasyonlar'dan demo kaynağının bağlantısını kesin.")}</div>
  </COSTERAAppShell>
 )
}
