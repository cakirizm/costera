import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { analyzeCost } from "@/lib/costera/engine";
import { sampleInput } from "@/lib/costera/sample";

const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const qty = (n: number, unit: string) => (n > 0 ? "+" : "") + n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + unit;

export default function VariancePage(){
 const analysis = analyzeCost(sampleInput);
 const t = analysis.totals;
 const top = analysis.ingredientVariance.slice(0, 5);

 return (
  <COSTERAAppShell active="/dashboard/variance" title="Cost Control" eyebrow="LIVE CALCULATION ENGINE">
   <div className="costera-control-banner">
    <div>
      <span>UNEXPLAINED COST THIS PERIOD</span>
      <strong>{money(t.unexplainedCost)}</strong>
      <small>{((t.unexplainedCost / t.netSales) * 100).toFixed(1)}% of net sales · calculated from POS + recipe + inventory data</small>
    </div>
    <div className="costera-control-flow">
      <span><b>{money(t.theoreticalCost)}</b><small>Theoretical recipe cost</small></span><i>+</i>
      <span><b>{money(t.knownWasteCost)}</b><small>Approved waste</small></span><i>+</i>
      <span className="danger"><b>{money(t.unexplainedCost)}</b><small>Unexplained variance</small></span><i>=</i>
      <span><b>{money(t.actualCost)}</b><small>Actual usage cost</small></span>
    </div>
   </div>

   <div className="costera-metrics four">
    <AppMetric label="Target Food Cost" value={t.targetFoodCostPct.toFixed(1) + "%"} meta="Configured target" tone="gold" />
    <AppMetric label="Actual Food Cost" value={t.actualFoodCostPct.toFixed(1) + "%"} meta={(t.targetGapPp >= 0 ? "+" : "") + t.targetGapPp.toFixed(1) + " pp vs target"} tone={t.targetGapPp > 0 ? "bad" : "good"} />
    <AppMetric label="Known Waste" value={money(t.knownWasteCost)} meta="Approved & explained" />
    <AppMetric label="Unexplained" value={money(t.unexplainedCost)} meta="Calculated by COSTERA engine" tone="bad" />
   </div>

   <section className="costera-grid control-layout">
    <article className="costera-panel span-2">
     <div className="costera-panel-head">
      <div><span>ROOT CAUSE</span><h2>Largest unexplained ingredient variances</h2></div>
      <a href="/api/engine/analyze" target="_blank">View engine JSON</a>
     </div>

     <div className="costera-table variance-table-v2">
      <div className="costera-table-row head">
       <span>Ingredient</span><span>Actual</span><span>Theoretical</span><span>Difference</span><span>Impact</span><span>Risk</span>
      </div>
      {top.map((r)=><div className="costera-table-row" key={r.ingredientId}>
       <span>{r.ingredient}</span>
       <span>{r.actualUsageQty.toLocaleString("en-US", { maximumFractionDigits: 2 })} {r.unit}</span>
       <span>{r.theoreticalQty.toLocaleString("en-US", { maximumFractionDigits: 2 })} {r.unit}</span>
       <span className={r.unexplainedQty > 0 ? "negative" : ""}>{qty(r.unexplainedQty, r.unit)}</span>
       <span className={r.unexplainedValue > 0 ? "negative" : ""}>{money(r.unexplainedValue)}</span>
       <span><StatusPill tone={r.risk==="High"?"bad":r.risk==="Medium"?"warning":"good"}>{r.risk}</StatusPill></span>
      </div>)}
     </div>
    </article>

    <article className="costera-panel">
      <div className="costera-panel-head"><div><span>ACTION ENGINE</span><h2>What COSTERA suggests</h2></div></div>
      <div className="costera-recommendations">
        {top.slice(0,3).map((r,i)=><div key={r.ingredientId}>
          <b>{String(i+1).padStart(2,"0")}</b>
          <p>
            <strong>Review {r.ingredient}</strong>
            <span>{qty(r.unexplainedQty, r.unit)} unexplained · {money(r.unexplainedValue)} financial impact · {r.variancePct ?? 0}% vs theoretical.</span>
          </p>
        </div>)}
      </div>
    </article>
   </section>

   <div className="costera-engine-foot">
    Engine source: normalized POS sales + recipe quantities + inventory opening/purchases/transfers/closing + approved waste.
   </div>
  </COSTERAAppShell>
 )
}
