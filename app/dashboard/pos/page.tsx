import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

import { getAppLocale, tx } from "@/lib/costera/i18n";

const rows = [
 ["Dine-in","1,840","$26,820","98.6%","Mapped"],
 ["Talabat","714","$12,640","97.2%","Mapped"],
 ["Deliveroo","508","$9,450","94.8%","3 unmapped"],
 ["Careem","276","$5,240","100%","Mapped"],
];

export default async function POSPage(){
 const locale = await getAppLocale();
 return (
  <COSTERAAppShell active="/dashboard/pos" locale={locale} title={tx(locale,"Sales & POS","Satış & POS")}>
   <div className="costera-metrics four">
    <AppMetric label="Orders" value="3,338" meta="+9.1% vs prior period" tone="good" />
    <AppMetric label="Net Sales" value="$58,240" meta="Across all channels" />
    <AppMetric label="Mapped Items" value="97.8%" meta="6 items need mapping" tone="gold" />
    <AppMetric label="Voids & Discounts" value="$1,920" meta="3.3% of gross sales" tone="bad" />
   </div>
   <section className="costera-grid">
    <article className="costera-panel span-3">
     <div className="costera-panel-head"><div><span>SALES FEED</span><h2>Channel mapping & completeness</h2></div><button>Sync now</button></div>
     <div className="costera-table">
      <div className="costera-table-row head"><span>Channel</span><span>Orders</span><span>Sales</span><span>Mapping</span><span>Status</span></div>
      {rows.map(r=><div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i}>{i===4?<StatusPill tone={c==="Mapped"?"good":"warning"}>{c}</StatusPill>:c}</span>)}</div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
