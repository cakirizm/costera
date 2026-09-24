import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { getSessionContext } from "@/lib/session";
import { getRestaurantInput } from "@/lib/costera/repository";
import type { CosteraInput } from "@/lib/costera/types";
import { getAppLocale, tx } from "@/lib/costera/i18n";
import { money } from "@/lib/format";

function discoveredChannels(input: CosteraInput) {
  const priceById = new Map(input.menuItems.map((m) => [m.id, m.sellingPrice]));
  const map = new Map<string, number>();
  for (const sale of input.sales) {
    const revenue = sale.netSales ?? sale.quantity * (priceById.get(sale.menuItemId) || 0);
    map.set(sale.channel, (map.get(sale.channel) || 0) + revenue);
  }
  return [...map.entries()]
    .map(([channel, sales]) => ({ channel, sales }))
    .sort((a,b) => b.sales - a.sales);
}

export default async function DashboardPage(){
 const locale = await getAppLocale();
 const ctx = await getSessionContext();
 const input = ctx?.restaurant ? await getRestaurantInput(ctx.restaurant.id) : null;

 if (!input) {
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
        title={tx(locale,"Your control center is ready for live data.","Kontrol merkezin canlı veri için hazır.")}
        text={tx(locale,"Connect a POS source or start the Universal POS Demo. COSTERA will turn incoming sales, recipes and inventory movements into a management-ready control view.","Bir POS kaynağı bağlayın veya Universal POS Demo'yu başlatın. COSTERA satış, reçete ve stok hareketlerini yönetim seviyesinde kontrol ekranına dönüştürecek.")}
      />
    </COSTERAAppShell>
   );
 }

 const currency = ctx?.restaurant?.currency ?? "USD";
 const analysis = analyzeCost(input);
 const t = analysis.totals;
 const varianceRows = analysis.ingredientVariance.slice(0,5);
 const channelRows = discoveredChannels(input);
 const maxChannel = Math.max(...channelRows.map((x)=>x.sales),1);
 const positiveGap = Math.max(0,t.unexplainedCost);
 const gapShare = t.netSales > 0 ? (positiveGap/t.netSales)*100 : 0;
 const mappedPct = analysis.dataQuality.salesCount > 0 ? Math.round((analysis.dataQuality.mappedSalesCount/analysis.dataQuality.salesCount)*100) : 0;

 const riskText=(risk:string)=> risk==="High" ? tx(locale,"High","Yüksek") : risk==="Medium" ? tx(locale,"Medium","Orta") : tx(locale,"Low","Düşük");

 return (
  <COSTERAAppShell active="/dashboard" locale={locale} title={tx(locale,"Overview","Genel Bakış")} eyebrow={tx(locale,"UNIVERSAL POS DEMO · CONNECTED","UNIVERSAL POS DEMO · BAĞLI")}>
   <div className="overview-welcome">
    <div>
      <span>{tx(locale,"EXECUTIVE CONTROL CENTER","YÖNETİM KONTROL MERKEZİ")}</span>
      <h2>{tx(locale,"See where margin is moving — and what needs action.","Marjın nereye gittiğini ve nerede aksiyon gerektiğini görün.")}</h2>
      <p>{tx(locale,"Sales, recipe cost, stock usage and unexplained variance are combined into one management view.","Satış, reçete maliyeti, stok kullanımı ve açıklanamayan fark tek yönetim ekranında birleştirildi.")}</p>
    </div>
    <div className="overview-welcome-status">
      <i />
      <div><strong>{tx(locale,"Data healthy","Veri sağlıklı")}</strong><small>{mappedPct}% {tx(locale,"sales mapping","satış eşleştirme")}</small></div>
    </div>
   </div>

   <div className="costera-alert-strip">
    <div><i>!</i><p>
      <strong>{money(t.unexplainedCost, currency)} {tx(locale,"unexplained cost requires review","açıklanamayan maliyet inceleme bekliyor")}</strong>
      <span>{tx(locale,"The gap remains after approved waste is removed.","Onaylı fire düşüldükten sonra kalan fark.")}</span>
    </p></div>
    <a href="/dashboard/variance">{tx(locale,"Investigate variance","Farkı incele")} →</a>
   </div>

   <div className="costera-metrics five">
    <AppMetric label={tx(locale,"Net Sales","Net Satış")} value={money(t.netSales, currency)} meta={analysis.dataQuality.mappedSalesCount + "/" + analysis.dataQuality.salesCount + " " + tx(locale,"sales rows mapped","satış satırı eşleşti")} tone="good" />
    <AppMetric label={tx(locale,"Target Food Cost","Hedef Food Cost")} value={t.targetFoodCostPct.toFixed(1) + "%"} meta={tx(locale,"Configured group target","Tanımlı grup hedefi")} tone="gold" />
    <AppMetric label={tx(locale,"Actual Food Cost","Gerçek Food Cost")} value={t.actualFoodCostPct.toFixed(1) + "%"} meta={(t.targetGapPp >= 0 ? "+" : "") + t.targetGapPp.toFixed(1) + " pp " + tx(locale,"vs target","hedefe göre")} tone={t.targetGapPp > 0 ? "bad" : "good"} />
    <AppMetric label={tx(locale,"Unexplained Variance","Açıklanamayan Fark")} value={money(t.unexplainedCost, currency)} meta={gapShare.toFixed(1) + "% " + tx(locale,"of net sales","net satışın")} tone="bad" />
    <AppMetric label={tx(locale,"Theoretical Cost","Teorik Maliyet")} value={money(t.theoreticalCost, currency)} meta={t.theoreticalFoodCostPct.toFixed(1) + "% " + tx(locale,"recipe-driven cost","reçete bazlı maliyet")} />
   </div>

   <section className="overview-premium-grid">
    <article className="costera-panel overview-trend-card">
      <div className="costera-panel-head">
        <div><span>{tx(locale,"FOOD COST PERFORMANCE","FOOD COST PERFORMANSI")}</span><h2>{tx(locale,"Actual food cost is trending above target","Gerçek food cost hedefin üzerinde ilerliyor")}</h2></div>
        <div className="costera-legend"><i className="actual"/>{tx(locale,"Actual","Gerçek")}<i className="target"/>{tx(locale,"Target","Hedef")}</div>
      </div>

      <div className="overview-chart-summary">
        <div><small>{tx(locale,"Current","Güncel")}</small><strong>{t.actualFoodCostPct.toFixed(1)}%</strong></div>
        <div><small>{tx(locale,"Target","Hedef")}</small><strong>{t.targetFoodCostPct.toFixed(1)}%</strong></div>
        <div className="bad"><small>{tx(locale,"Gap","Fark")}</small><strong>+{Math.max(0,t.targetGapPp).toFixed(1)} pp</strong></div>
      </div>

      <div className="overview-area-chart">
        <div className="overview-y-labels"><span>34%</span><span>30%</span><span>26%</span><span>22%</span></div>
        <svg viewBox="0 0 760 290" preserveAspectRatio="none" aria-label="Food cost trend">
          <defs>
            <linearGradient id="overviewArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#174968" stopOpacity=".22"/>
              <stop offset="100%" stopColor="#174968" stopOpacity=".015"/>
            </linearGradient>
          </defs>
          <path className="area" d="M0 232 C55 204,92 176,135 188 S218 135,270 153 S365 116,412 128 S505 91,555 108 S655 80,760 60 L760 290 L0 290 Z"/>
          <path className="line" d="M0 232 C55 204,92 176,135 188 S218 135,270 153 S365 116,412 128 S505 91,555 108 S655 80,760 60"/>
          <path className="target" d="M0 205 L760 205"/>
          <circle cx="760" cy="60" r="6"/>
        </svg>
        <div className="overview-x-labels"><span>Sep 1</span><span>Sep 7</span><span>Sep 14</span><span>Sep 21</span></div>
        <div className="overview-chart-tooltip"><small>{tx(locale,"Today","Bugün")}</small><strong>{t.actualFoodCostPct.toFixed(1)}%</strong><span>+{Math.max(0,t.targetGapPp).toFixed(1)} pp</span></div>
      </div>
    </article>

    <article className="costera-panel overview-pulse-card">
      <div className="costera-panel-head"><div><span>{tx(locale,"CONTROL PULSE","KONTROL NABZI")}</span><h2>{tx(locale,"Cost position","Maliyet pozisyonu")}</h2></div></div>

      <div className="overview-gauge-row">
        <div className="overview-gauge" style={{background: "conic-gradient(#c54e42 0 " + Math.min(100,t.actualFoodCostPct*2.8) + "%,#edf1f3 " + Math.min(100,t.actualFoodCostPct*2.8) + "% 100%)"}}>
          <div><strong>{t.actualFoodCostPct.toFixed(1)}%</strong><small>{tx(locale,"actual FC","gerçek FC")}</small></div>
        </div>
        <div className="overview-gauge-copy">
          <span>{tx(locale,"TARGET","HEDEF")} {t.targetFoodCostPct.toFixed(1)}%</span>
          <strong>{tx(locale,"Above target","Hedef üzerinde")}</strong>
          <p>{tx(locale,"The largest opportunity is in unexplained ingredient usage, not approved waste.","En büyük fırsat onaylı firede değil, açıklanamayan malzeme kullanımında.")}</p>
        </div>
      </div>

      <div className="overview-pulse-list">
        <div><span>{tx(locale,"Theoretical","Teorik")}</span><b>{money(t.theoreticalCost, currency)}</b><i className="neutral"/></div>
        <div><span>{tx(locale,"Approved waste","Onaylı fire")}</span><b>{money(t.knownWasteCost, currency)}</b><i className="gold"/></div>
        <div><span>{tx(locale,"Unexplained","Açıklanamayan")}</span><b className="bad">{money(t.unexplainedCost, currency)}</b><i className="red"/></div>
      </div>

      <a href="/dashboard/variance" className="overview-primary-action">{tx(locale,"Open Cost Control","Maliyet Kontrolünü Aç")} <span>→</span></a>
    </article>
   </section>

   <section className="overview-lower-grid">
    <article className="costera-panel overview-variance-card">
     <div className="costera-panel-head"><div><span>{tx(locale,"LEAKAGE DRIVERS","KAÇAK SÜRÜCÜLERİ")}</span><h2>{tx(locale,"Ingredients with the highest financial impact","Finansal etkisi en yüksek malzemeler")}</h2></div><a href="/dashboard/variance">{tx(locale,"Full analysis","Tüm analiz")}</a></div>
     <div className="overview-driver-table">
      <div className="head"><span>{tx(locale,"Ingredient","Malzeme")}</span><span>{tx(locale,"Unexplained","Açıklanamayan")}</span><span>{tx(locale,"Impact","Etki")}</span><span>{tx(locale,"Share","Pay")}</span><span>{tx(locale,"Risk","Risk")}</span></div>
      {varianceRows.map((r,index)=><div className="row" key={r.ingredientId}>
       <span><i>{String(index+1).padStart(2,"0")}</i><b>{r.ingredient}</b></span>
       <span className={r.unexplainedQty>0?"negative":""}>{r.unexplainedQty>0?"+":""}{r.unexplainedQty} {r.unit}</span>
       <span className={r.unexplainedValue>0?"negative":""}>{money(r.unexplainedValue, currency)}</span>
       <span><em><u style={{width: Math.min(100,r.shareOfGapPct)+"%"}}/></em>{r.shareOfGapPct}%</span>
       <span><StatusPill tone={r.risk==="High"?"bad":r.risk==="Medium"?"warning":"good"}>{riskText(r.risk)}</StatusPill></span>
      </div>)}
     </div>
    </article>

    <article className="costera-panel overview-channel-card">
     <div className="costera-panel-head"><div><span>{tx(locale,"SALES CHANNELS","SATIŞ KANALLARI")}</span><h2>{tx(locale,"Channel mix","Kanal dağılımı")}</h2></div><a href="/dashboard/delivery">{tx(locale,"Details","Detay")}</a></div>
     <div className="overview-channel-total"><span>{tx(locale,"Tracked sales","Takip edilen satış")}</span><strong>{money(channelRows.reduce((s,x)=>s+x.sales,0), currency)}</strong></div>
     <div className="overview-channel-bars">
      {channelRows.map((r)=><div key={r.channel}>
        <div><span>{r.channel}</span><b>{money(r.sales, currency)}</b></div>
        <i><em style={{width: Math.max(8,(r.sales/maxChannel)*100)+"%"}} /></i>
        <small>{r.channel.toLowerCase()==="dine-in"?tx(locale,"Direct sale","Direkt satış"):tx(locale,"Check fee coverage","Komisyon verisini kontrol et")}</small>
      </div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
