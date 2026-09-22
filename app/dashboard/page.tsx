import { cookies } from "next/headers";
import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { sampleInput } from "@/lib/costera/sample";

const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

const channelRows = [
  ["Dine-in","$26,820","28.1%","22.4%"],
  ["Talabat","$12,640","31.9%","14.2%"],
  ["Deliveroo","$9,450","35.8%","8.1%"],
  ["Careem","$5,240","33.1%","10.8%"],
];

export default async function DashboardPage(){
 const cookieStore = await cookies();
 const demoConnected = cookieStore.get("costera_polaris_demo")?.value === "1";

 if (!demoConnected) {
   return (
    <COSTERAAppShell active="/dashboard" title="Overview" eyebrow="NO LIVE SOURCE">
      <div className="costera-metrics five">
        <AppMetric label="Net Sales" value="$0" meta="No connected source" />
        <AppMetric label="Target Food Cost" value="25.0%" meta="Configured target" tone="gold" />
        <AppMetric label="Actual Food Cost" value="—" meta="Waiting for data" />
        <AppMetric label="Unexplained Variance" value="$0" meta="Waiting for data" />
        <AppMetric label="Theoretical Cost" value="$0" meta="Waiting for recipe sales data" />
      </div>
      <EmptyWorkspace />
    </COSTERAAppShell>
   );
 }

 const analysis = analyzeCost(sampleInput);
 const t = analysis.totals;
 const varianceRows = analysis.ingredientVariance.slice(0,4);

 return (
  <COSTERAAppShell active="/dashboard" title="Overview" eyebrow="POLARIS DEMO · CONNECTED">
   <div className="costera-alert-strip">
    <div><i>!</i><p>
      <strong>{money(t.unexplainedCost)} unexplained cost requires review</strong>
      <span>Calculated from the connected Polaris demo feed.</span>
    </p></div>
    <a href="/dashboard/variance">Open Cost Control →</a>
   </div>

   <div className="costera-metrics five">
    <AppMetric label="Net Sales" value={money(t.netSales)} meta={analysis.dataQuality.mappedSalesCount + "/" + analysis.dataQuality.salesCount + " sales rows mapped"} tone="good" />
    <AppMetric label="Target Food Cost" value={t.targetFoodCostPct.toFixed(1) + "%"} meta="Configured group target" tone="gold" />
    <AppMetric label="Actual Food Cost" value={t.actualFoodCostPct.toFixed(1) + "%"} meta={(t.targetGapPp >= 0 ? "+" : "") + t.targetGapPp.toFixed(1) + " pp vs target"} tone={t.targetGapPp > 0 ? "bad" : "good"} />
    <AppMetric label="Unexplained Variance" value={money(t.unexplainedCost)} meta={((t.unexplainedCost/t.netSales)*100).toFixed(1) + "% of net sales"} tone="bad" />
    <AppMetric label="Theoretical Cost" value={money(t.theoreticalCost)} meta={t.theoreticalFoodCostPct.toFixed(1) + "% recipe-driven cost"} />
   </div>

   <section className="costera-grid overview-grid">
    <article className="costera-panel span-2">
     <div className="costera-panel-head"><div><span>FOOD COST TREND</span><h2>Actual vs target</h2></div><div className="costera-legend"><i className="actual"/>Actual<i className="target"/>Target</div></div>
     <div className="costera-line-chart">
       <div className="costera-target-line" />
       <svg viewBox="0 0 700 250" preserveAspectRatio="none"><path d="M0 192 C66 135,115 166,172 118 S285 150,350 98 S465 139,535 85 S632 98,700 58" fill="none" stroke="#0a2b45" strokeWidth="7" strokeLinecap="round"/></svg>
       <div className="costera-chart-labels"><span>Sep 1</span><span>Sep 7</span><span>Sep 14</span><span>Sep 21</span></div>
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>DATA QUALITY</span><h2>Engine readiness</h2></div></div>
     <div className="costera-quality-block">
       <div><span>Sales mapping</span><b>{analysis.dataQuality.mappedSalesCount}/{analysis.dataQuality.salesCount}</b><em className="good">Ready</em></div>
       <div><span>Missing menu IDs</span><b>{analysis.dataQuality.missingMenuItems.length}</b><em className={analysis.dataQuality.missingMenuItems.length ? "bad" : "good"}>{analysis.dataQuality.missingMenuItems.length ? "Review" : "Clear"}</em></div>
       <div><span>Missing ingredient IDs</span><b>{analysis.dataQuality.missingIngredients.length}</b><em className={analysis.dataQuality.missingIngredients.length ? "bad" : "good"}>{analysis.dataQuality.missingIngredients.length ? "Review" : "Clear"}</em></div>
       <a href="/dashboard/integrations">Manage source →</a>
     </div>
    </article>
   </section>

   <section className="costera-grid overview-bottom-grid">
    <article className="costera-panel span-2">
     <div className="costera-panel-head"><div><span>TOP VARIANCES</span><h2>Ingredients requiring attention</h2></div><a href="/dashboard/variance">View analysis</a></div>
     <div className="costera-table overview-table">
      <div className="costera-table-row head"><span>Ingredient</span><span>Difference</span><span>Impact</span><span>Variance %</span><span>Risk</span></div>
      {varianceRows.map(r=><div className="costera-table-row" key={r.ingredientId}>
       <span>{r.ingredient}</span>
       <span className={r.unexplainedQty>0?"negative":""}>{r.unexplainedQty>0?"+":""}{r.unexplainedQty} {r.unit}</span>
       <span className={r.unexplainedValue>0?"negative":""}>{money(r.unexplainedValue)}</span>
       <span>{r.variancePct ?? 0}%</span>
       <span><StatusPill tone={r.risk==="High"?"bad":r.risk==="Medium"?"warning":"good"}>{r.risk}</StatusPill></span>
      </div>)}
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>CHANNEL PROFITABILITY</span><h2>Sales channel economics</h2></div><a href="/dashboard/delivery">Open delivery</a></div>
     <div className="costera-channel-list">
      {channelRows.map(r=><div key={r[0]}><p><strong>{r[0]}</strong><span>{r[1]}</span></p><p><small>Food Cost</small><b>{r[2]}</b></p><p><small>Net Margin</small><b className="positive">{r[3]}</b></p></div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
