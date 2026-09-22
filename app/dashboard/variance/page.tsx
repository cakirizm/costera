import { cookies } from "next/headers";
import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { EmptyWorkspace } from "@/components/app/EmptyWorkspace";
import { analyzeCost } from "@/lib/costera/engine";
import { sampleInput } from "@/lib/costera/sample";

const money = (n: number) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const qty = (n: number, unit: string) =>
  (n > 0 ? "+" : "") + n.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " " + unit;

export default async function VariancePage(){
 const cookieStore = await cookies();
 const demoConnected = cookieStore.get("costera_pos_demo")?.value === "1";

 if (!demoConnected) {
   return (
    <COSTERAAppShell active="/dashboard/variance" title="Cost Control" eyebrow="NO LIVE SOURCE">
      <div className="costera-metrics four">
        <AppMetric label="Target Food Cost" value="25.0%" meta="Configured target" tone="gold" />
        <AppMetric label="Actual Food Cost" value="—" meta="Waiting for live data" />
        <AppMetric label="Approved Waste" value="$0" meta="Waiting for live data" />
        <AppMetric label="Unexplained" value="$0" meta="Waiting for live data" />
      </div>
      <EmptyWorkspace
        title="Cost Control is waiting for a data source."
        text="Connect the Universal POS Demo or any real POS source. COSTERA will then calculate Expected → Actual → Approved Waste → Unexplained automatically."
      />
    </COSTERAAppShell>
   );
 }

 const analysis = analyzeCost(sampleInput);
 const t = analysis.totals;
 const top = analysis.ingredientVariance.slice(0, 5);
 const focus = top[0];

 return (
  <COSTERAAppShell active="/dashboard/variance" title="Cost Control" eyebrow="UNIVERSAL POS DEMO · CONNECTED">
   <div className="control-hero-v2">
    <div className="control-hero-copy">
      <span>UNEXPLAINED COST THIS PERIOD</span>
      <strong>{money(t.unexplainedCost)}</strong>
      <small>{((t.unexplainedCost / t.netSales) * 100).toFixed(1)}% of net sales · after approved waste is removed</small>
    </div>

    <div className="control-equation-v2">
      <div>
        <small>Expected usage</small>
        <b>{money(t.theoreticalCost)}</b>
        <span>Recipe driven</span>
      </div>
      <i>→</i>
      <div>
        <small>Actual usage</small>
        <b>{money(t.actualCost)}</b>
        <span>Inventory movement</span>
      </div>
      <i>−</i>
      <div>
        <small>Approved waste</small>
        <b>{money(t.knownWasteCost)}</b>
        <span>Explained loss</span>
      </div>
      <i>=</i>
      <div className="danger">
        <small>Unexplained</small>
        <b>{money(t.unexplainedCost)}</b>
        <span>Needs action</span>
      </div>
    </div>
   </div>

   <div className="costera-metrics four">
    <AppMetric label="Target Food Cost" value={t.targetFoodCostPct.toFixed(1) + "%"} meta="Configured target" tone="gold" />
    <AppMetric label="Actual Food Cost" value={t.actualFoodCostPct.toFixed(1) + "%"} meta={(t.targetGapPp >= 0 ? "+" : "") + t.targetGapPp.toFixed(1) + " pp vs target"} tone={t.targetGapPp > 0 ? "bad" : "good"} />
    <AppMetric label="Approved Waste" value={money(t.knownWasteCost)} meta="Known & explained" />
    <AppMetric label="Unexplained" value={money(t.unexplainedCost)} meta="Remaining leakage" tone="bad" />
   </div>

   {focus && (
    <section className="control-focus-card">
      <div className="control-focus-head">
        <div>
          <span>TOP PRIORITY</span>
          <h2>{focus.ingredient}</h2>
          <p>{focus.shareOfGapPct}% of the current positive unexplained cost</p>
        </div>
        <StatusPill tone={focus.risk==="High"?"bad":focus.risk==="Medium"?"warning":"good"}>{focus.risk} Risk</StatusPill>
      </div>

      <div className="control-flow-row">
        <div>
          <small>EXPECTED</small>
          <strong>{focus.theoreticalQty} {focus.unit}</strong>
          <span>Recipe-driven usage</span>
        </div>
        <i>→</i>
        <div>
          <small>ACTUAL</small>
          <strong>{focus.actualUsageQty} {focus.unit}</strong>
          <span>Stock-derived usage</span>
        </div>
        <i>−</i>
        <div>
          <small>WASTE</small>
          <strong>{focus.knownWasteQty} {focus.unit}</strong>
          <span>Approved / explained</span>
        </div>
        <i>=</i>
        <div className="danger">
          <small>UNEXPLAINED</small>
          <strong>{qty(focus.unexplainedQty, focus.unit)}</strong>
          <span>{money(focus.unexplainedValue)} impact</span>
        </div>
      </div>

      <div className="control-intelligence">
        <div className="control-cause">
          <span>POSSIBLE CAUSE</span>
          <h3>{focus.rootCause.label}</h3>
          <p>{focus.rootCause.reason}</p>
          <b className={"confidence " + focus.rootCause.confidence.toLowerCase()}>
            {focus.rootCause.confidence} confidence
          </b>
        </div>

        <div className="control-action">
          <span>RECOMMENDED ACTION</span>
          <h3>What to do next</h3>
          <p>{focus.rootCause.action}</p>
          <button>Mark for review</button>
        </div>
      </div>
    </section>
   )}

   <section className="costera-grid control-layout">
    <article className="costera-panel span-2">
     <div className="costera-panel-head">
      <div><span>VARIANCE EXPLORER</span><h2>Expected → Actual → Waste → Unexplained</h2></div>
      <a href="/dashboard/integrations">Manage source</a>
     </div>

     <div className="control-table-v3">
      <div className="head">
       <span>Ingredient</span><span>Expected</span><span>Actual</span><span>Waste</span><span>Unexplained</span><span>Impact</span><span>Cause</span>
      </div>
      {top.map((r)=><div className="row" key={r.ingredientId}>
       <span><b>{r.ingredient}</b><small>{r.risk} risk · {r.shareOfGapPct}% share</small></span>
       <span>{r.theoreticalQty} {r.unit}</span>
       <span>{r.actualUsageQty} {r.unit}</span>
       <span>{r.knownWasteQty} {r.unit}</span>
       <span className={r.unexplainedQty > 0 ? "negative" : "positive"}>{qty(r.unexplainedQty, r.unit)}</span>
       <span className={r.unexplainedValue > 0 ? "negative" : "positive"}>{money(r.unexplainedValue)}</span>
       <span><b className="cause-label">{r.rootCause.label}</b><small>{r.rootCause.confidence} confidence</small></span>
      </div>)}
     </div>
    </article>

    <article className="costera-panel">
      <div className="costera-panel-head"><div><span>ACTION QUEUE</span><h2>What management should review</h2></div></div>
      <div className="control-action-list">
        {top.slice(0,4).map((r,i)=><div key={r.ingredientId}>
          <b>{String(i+1).padStart(2,"0")}</b>
          <p>
            <strong>{r.ingredient}</strong>
            <span>{r.rootCause.action}</span>
          </p>
          <em>{money(r.unexplainedValue)}</em>
        </div>)}
      </div>
    </article>
   </section>

   <div className="costera-engine-foot">
    The demo uses the same COSTERA calculation engine as future POS and delivery connectors. Disconnect the demo source from Integrations to return this page to zero data.
   </div>
  </COSTERAAppShell>
 )
}
