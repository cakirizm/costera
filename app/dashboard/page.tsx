import { cookies } from "next/headers";
import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { sampleInput } from "@/lib/costera/sample";
import { getAppLocale, tx } from "@/lib/costera/i18n";

const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

function discoveredChannels() {
  const map = new Map<string, number>();
  for (const sale of sampleInput.sales) map.set(sale.channel, (map.get(sale.channel) || 0) + (sale.netSales || 0));
  return [...map.entries()].map(([channel, sales]) => ({ channel, sales }));
}

export default async function DashboardPage(){
 const locale = await getAppLocale();
 const cookieStore = await cookies();
 const demoConnected = cookieStore.get("costera_pos_demo")?.value === "1";
 const tr = locale === "tr";

 if (!demoConnected) {
   return (
    <COSTERAAppShell active="/dashboard" locale={locale} title={tx(locale,"Overview","Genel Bakış")} eyebrow={tx(locale,"NO LIVE SOURCE","CANLI VERİ KAYNAĞI YOK")}>
      <div className="costera-metrics five">
        <AppMetric label={tx(locale,"Net Sales","Net Satış")} value="$0" meta={tx(locale,"No connected source","Bağlı veri kaynağı yok")} />
        <AppMetric label={tx(locale,"Target Food Cost","Hedef Food Cost")} value="25.0%" meta={tx(locale,"Configured target","Tanımlı hedef")} tone="gold" />
        <AppMetric label={tx(locale,"Actual Food Cost","Gerçek Food Cost")} value="—" meta={tx(locale,"Waiting for data","Veri bekleniyor")} />
        <AppMetric label={tx(locale,"Unexplained Variance","Açıklanamayan Fark")} value="$0" meta={tx(locale,"Waiting for data","Veri bekleniyor")} />
        <AppMetric label={tx(locale,"Theoretical Cost","Teorik Maliyet")} value="$0" meta={tx(locale,"Waiting for recipe sales data","Reçete ve satış verisi bekleniyor")} />
      </div>
      <EmptyWorkspace
        locale={locale}
        title={tx(locale,"No live data connected yet.","Henüz canlı veri bağlantısı yok.")}
        text={tx(locale,"Connect a POS source or start the Universal POS Demo to populate this workspace.","Bu ekranı doldurmak için bir POS bağlayın veya Universal POS Demo'yu başlatın.")}
      />
    </COSTERAAppShell>
   );
 }

 const analysis = analyzeCost(sampleInput);
 const t = analysis.totals;
 const varianceRows = analysis.ingredientVariance.slice(0,4);
 const channelRows = discoveredChannels();

 const riskText=(risk:string)=> risk==="High" ? tx(locale,"High","Yüksek") : risk==="Medium" ? tx(locale,"Medium","Orta") : tx(locale,"Low","Düşük");

 return (
  <COSTERAAppShell active="/dashboard" locale={locale} title={tx(locale,"Overview","Genel Bakış")} eyebrow={tx(locale,"UNIVERSAL POS DEMO · CONNECTED","UNIVERSAL POS DEMO · BAĞLI")}>
   <div className="costera-alert-strip">
    <div><i>!</i><p>
      <strong>{money(t.unexplainedCost)} {tx(locale,"unexplained cost requires review","açıklanamayan maliyet inceleme bekliyor")}</strong>
      <span>{tx(locale,"Calculated from the connected POS demo feed.","Bağlı POS demo akışından hesaplandı.")}</span>
    </p></div>
    <a href="/dashboard/variance">{tx(locale,"Open Cost Control","Maliyet Kontrolünü Aç")} →</a>
   </div>

   <div className="costera-metrics five">
    <AppMetric label={tx(locale,"Net Sales","Net Satış")} value={money(t.netSales)} meta={analysis.dataQuality.mappedSalesCount + "/" + analysis.dataQuality.salesCount + " " + tx(locale,"sales rows mapped","satış satırı eşleşti")} tone="good" />
    <AppMetric label={tx(locale,"Target Food Cost","Hedef Food Cost")} value={t.targetFoodCostPct.toFixed(1) + "%"} meta={tx(locale,"Configured group target","Tanımlı grup hedefi")} tone="gold" />
    <AppMetric label={tx(locale,"Actual Food Cost","Gerçek Food Cost")} value={t.actualFoodCostPct.toFixed(1) + "%"} meta={(t.targetGapPp >= 0 ? "+" : "") + t.targetGapPp.toFixed(1) + " pp " + tx(locale,"vs target","hedefe göre")} tone={t.targetGapPp > 0 ? "bad" : "good"} />
    <AppMetric label={tx(locale,"Unexplained Variance","Açıklanamayan Fark")} value={money(t.unexplainedCost)} meta={((t.unexplainedCost/t.netSales)*100).toFixed(1) + "% " + tx(locale,"of net sales","net satışın")} tone="bad" />
    <AppMetric label={tx(locale,"Theoretical Cost","Teorik Maliyet")} value={money(t.theoreticalCost)} meta={t.theoreticalFoodCostPct.toFixed(1) + "% " + tx(locale,"recipe-driven cost","reçete bazlı maliyet")} />
   </div>

   <section className="costera-grid overview-grid">
    <article className="costera-panel span-2">
     <div className="costera-panel-head"><div><span>{tx(locale,"FOOD COST TREND","FOOD COST TRENDİ")}</span><h2>{tx(locale,"Actual vs target","Gerçek vs hedef")}</h2></div><div className="costera-legend"><i className="actual"/>{tx(locale,"Actual","Gerçek")}<i className="target"/>{tx(locale,"Target","Hedef")}</div></div>
     <div className="costera-line-chart">
       <div className="costera-target-line" />
       <svg viewBox="0 0 700 250" preserveAspectRatio="none"><path d="M0 192 C66 135,115 166,172 118 S285 150,350 98 S465 139,535 85 S632 98,700 58" fill="none" stroke="#0a2b45" strokeWidth="7" strokeLinecap="round"/></svg>
       <div className="costera-chart-labels"><span>Sep 1</span><span>Sep 7</span><span>Sep 14</span><span>Sep 21</span></div>
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"DATA QUALITY","VERİ KALİTESİ")}</span><h2>{tx(locale,"Engine readiness","Motor hazırlığı")}</h2></div></div>
     <div className="costera-quality-block">
       <div><span>{tx(locale,"Sales mapping","Satış eşleştirme")}</span><b>{analysis.dataQuality.mappedSalesCount}/{analysis.dataQuality.salesCount}</b><em className="good">{tx(locale,"Ready","Hazır")}</em></div>
       <div><span>{tx(locale,"Missing menu IDs","Eksik menü ID")}</span><b>{analysis.dataQuality.missingMenuItems.length}</b><em className={analysis.dataQuality.missingMenuItems.length ? "bad" : "good"}>{analysis.dataQuality.missingMenuItems.length ? tx(locale,"Review","İncele") : tx(locale,"Clear","Temiz")}</em></div>
       <div><span>{tx(locale,"Missing ingredient IDs","Eksik malzeme ID")}</span><b>{analysis.dataQuality.missingIngredients.length}</b><em className={analysis.dataQuality.missingIngredients.length ? "bad" : "good"}>{analysis.dataQuality.missingIngredients.length ? tx(locale,"Review","İncele") : tx(locale,"Clear","Temiz")}</em></div>
       <a href="/dashboard/integrations">{tx(locale,"Manage source","Kaynağı yönet")} →</a>
     </div>
    </article>
   </section>

   <section className="costera-grid overview-bottom-grid">
    <article className="costera-panel span-2">
     <div className="costera-panel-head"><div><span>{tx(locale,"TOP VARIANCES","EN BÜYÜK FARKLAR")}</span><h2>{tx(locale,"Ingredients requiring attention","İncelenmesi gereken malzemeler")}</h2></div><a href="/dashboard/variance">{tx(locale,"View analysis","Analizi görüntüle")}</a></div>
     <div className="costera-table overview-table">
      <div className="costera-table-row head"><span>{tx(locale,"Ingredient","Malzeme")}</span><span>{tx(locale,"Difference","Fark")}</span><span>{tx(locale,"Impact","Etki")}</span><span>{tx(locale,"Variance %","Fark %")}</span><span>{tx(locale,"Risk","Risk")}</span></div>
      {varianceRows.map(r=><div className="costera-table-row" key={r.ingredientId}>
       <span>{r.ingredient}</span>
       <span className={r.unexplainedQty>0?"negative":""}>{r.unexplainedQty>0?"+":""}{r.unexplainedQty} {r.unit}</span>
       <span className={r.unexplainedValue>0?"negative":""}>{money(r.unexplainedValue)}</span>
       <span>{r.variancePct ?? 0}%</span>
       <span><StatusPill tone={r.risk==="High"?"bad":r.risk==="Medium"?"warning":"good"}>{riskText(r.risk)}</StatusPill></span>
      </div>)}
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"CHANNEL DISCOVERY","KANAL KEŞFİ")}</span><h2>{tx(locale,"Channels found in the POS feed","POS akışında bulunan kanallar")}</h2></div><a href="/dashboard/delivery">{tx(locale,"Open channels","Kanalları aç")}</a></div>
     <div className="costera-channel-list">
      {channelRows.map((r)=><div key={r.channel}>
        <p><strong>{r.channel}</strong><span>{"$" + r.sales.toLocaleString()}</span></p>
        <p><small>{tx(locale,"Source","Kaynak")}</small><b>POS</b></p>
        <p><small>{tx(locale,"Financial data","Finansal veri")}</small><b className={r.channel.toLowerCase()==="dine-in"?"positive":""}>{r.channel.toLowerCase()==="dine-in"?tx(locale,"Not required","Gerekli değil"):tx(locale,"Check fees","Ücretleri kontrol et")}</b></p>
      </div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
