import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

const rows = [
 ["Talabat","$12,640","$3,580","$1,896","$1,370","10.8%","Healthy"],
 ["Deliveroo","$9,450","$3,383","$1,701","$765","8.1%","Low"],
 ["Careem","$5,240","$1,735","$891","$566","10.8%","Healthy"],
];

export default function DeliveryPage(){
 return (
  <COSTERAAppShell active="/dashboard/delivery" title="Delivery">
   <div className="costera-metrics five">
    <AppMetric label="Delivery Sales" value="$27,330" meta="46.9% of net sales" />
    <AppMetric label="Platform Fees" value="$4,488" meta="16.4% blended rate" tone="gold" />
    <AppMetric label="Food Cost" value="$8,698" meta="31.8% blended" tone="bad" />
    <AppMetric label="Net Contribution" value="$2,701" meta="9.9% margin" tone="good" />
    <AppMetric label="Settlement Gap" value="$340" meta="Needs reconciliation" tone="bad" />
   </div>
   <section className="costera-grid">
    <article className="costera-panel span-3">
     <div className="costera-panel-head"><div><span>CHANNEL ECONOMICS</span><h2>Talabat, Deliveroo & Careem</h2></div><button>Reconcile settlements</button></div>
     <div className="costera-table delivery-table">
      <div className="costera-table-row head"><span>Channel</span><span>Sales</span><span>Food Cost</span><span>Fees</span><span>Net Contribution</span><span>Net Margin</span><span>Status</span></div>
      {rows.map(r=><div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i}>{i===6?<StatusPill tone={c==="Healthy"?"good":"warning"}>{c}</StatusPill>:c}</span>)}</div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
