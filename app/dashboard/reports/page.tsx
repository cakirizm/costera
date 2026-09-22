import { COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

const reports = [
 ["Daily Cost Pulse","Today","Food cost, sales, variance","Ready"],
 ["Weekly Leakage Review","Sep 16–22","Root causes & actions","Ready"],
 ["Monthly Management P&L","September","Profitability summary","Draft"],
 ["Delivery Settlement Reconciliation","September","Talabat / Deliveroo / Careem","Review"],
];

export default function ReportsPage(){
 return (
  <COSTERAAppShell active="/dashboard/reports" title="Reports">
   <section className="costera-grid">
    <article className="costera-panel span-3">
     <div className="costera-panel-head"><div><span>REPORT LIBRARY</span><h2>Management reports</h2></div><button>+ Build report</button></div>
     <div className="costera-report-grid">
      {reports.map(r=><div className="costera-report-card" key={r[0]}>
       <span>▦</span><h3>{r[0]}</h3><p>{r[2]}</p>
       <div><small>{r[1]}</small><StatusPill tone={r[3]==="Ready"?"good":r[3]==="Draft"?"neutral":"warning"}>{r[3]}</StatusPill></div>
      </div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
