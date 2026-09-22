import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

const variance = [
 ["Minced Beef","148 kg","131 kg","+17 kg","$561","High"],
 ["Chicken Breast","201 kg","190 kg","+11 kg","$176","High"],
 ["Olive Oil","44 L","40 L","+4 L","$52","Medium"],
 ["Mozzarella","76 kg","73 kg","+3 kg","$39","Medium"],
 ["Avocado","62 kg","61 kg","+1 kg","$18","Low"],
];

export default function VariancePage(){
 return <COSTERAAppShell active="/dashboard/variance" title="Cost Control" eyebrow="LEAKAGE & VARIANCE">
  <div className="costera-control-banner">
    <div><span>UNEXPLAINED COST THIS PERIOD</span><strong>$2,480</strong><small>4.3% of net sales · requires review</small></div>
    <div className="costera-control-flow">
      <span><b>$14,720</b><small>Opening + purchases</small></span><i>−</i>
      <span><b>$12,240</b><small>Theoretical usage</small></span><i>=</i>
      <span className="danger"><b>$2,480</b><small>Unexplained variance</small></span>
    </div>
  </div>
  <div className="costera-metrics four">
   <AppMetric label="Target Food Cost" value="25.0%" meta="Configured target" tone="gold" />
   <AppMetric label="Actual Food Cost" value="29.4%" meta="+4.4 pp above target" tone="bad" />
   <AppMetric label="Known Waste" value="$610" meta="Approved & explained" />
   <AppMetric label="Unexplained" value="$2,480" meta="Needs root-cause review" tone="bad" />
  </div>
  <section className="costera-grid control-layout">
   <article className="costera-panel span-2">
    <div className="costera-panel-head"><div><span>ROOT CAUSE</span><h2>Largest unexplained ingredient variances</h2></div><button>Review all</button></div>
    <div className="costera-table variance-table-v2">
     <div className="costera-table-row head"><span>Ingredient</span><span>Actual</span><span>Theoretical</span><span>Difference</span><span>Impact</span><span>Risk</span></div>
     {variance.map(r=><div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i} className={(i===3||i===4)?"negative":""}>{i===5?<StatusPill tone={c==="High"?"bad":c==="Medium"?"warning":"good"}>{c}</StatusPill>:c}</span>)}</div>)}
    </div>
   </article>
   <article className="costera-panel">
     <div className="costera-panel-head"><div><span>ACTION ENGINE</span><h2>What COSTERA suggests</h2></div></div>
     <div className="costera-recommendations">
       <div><b>01</b><p><strong>Count beef stock tonight</strong><span>$561 variance is 22.6% of total unexplained cost.</span></p></div>
       <div><b>02</b><p><strong>Check portioning</strong><span>Chicken variance started after Sep 14 evening shift.</span></p></div>
       <div><b>03</b><p><strong>Review olive oil waste</strong><span>No waste record exists for 4 L difference.</span></p></div>
     </div>
   </article>
  </section>
 </COSTERAAppShell>
}
