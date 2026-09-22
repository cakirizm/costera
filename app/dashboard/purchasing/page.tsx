import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

import { getAppLocale, tx } from "@/lib/costera/i18n";

const rows = [
  ["Metro","Beef Tenderloin","$18.40","$19.90","+8.2%","Review"],
  ["Bidfood","Chicken Breast","$4.82","$5.12","+6.2%","Watch"],
  ["Fresh Supply","Avocado","$7.40","$6.95","-6.1%","Good"],
  ["Gulf Foods","Olive Oil","$12.20","$13.00","+6.6%","Watch"],
];

export default async function PurchasingPage(){
 const locale = await getAppLocale();
 return (
  <COSTERAAppShell active="/dashboard/purchasing" locale={locale} title={tx(locale,"Purchasing","Satın Alma")}>
   <div className="costera-metrics four">
    <AppMetric label="Purchases MTD" value="$14,720" meta="+5.4% vs previous period" />
    <AppMetric label="Supplier Price Increases" value="9" meta="Affecting 21 recipes" tone="bad" />
    <AppMetric label="Largest Increase" value="+8.2%" meta="Beef Tenderloin" tone="bad" />
    <AppMetric label="Potential Savings" value="$690" meta="Based on alternate pricing" tone="good" />
   </div>
   <section className="costera-grid">
    <article className="costera-panel span-3">
      <div className="costera-panel-head"><div><span>SUPPLIER PRICE MOVEMENT</span><h2>Cost changes affecting recipes</h2></div><button>Import purchase file</button></div>
      <div className="costera-table">
       <div className="costera-table-row head"><span>Supplier</span><span>Ingredient</span><span>Previous</span><span>Current</span><span>Change</span><span>Status</span></div>
       {rows.map(r=><div className="costera-table-row" key={r[1]}>{r.map((c,i)=><span key={i} className={i===4&&c.startsWith("+")?"negative":""}>{i===5?<StatusPill tone={c==="Good"?"good":c==="Watch"?"warning":"bad"}>{c}</StatusPill>:c}</span>)}</div>)}
      </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
