import { AppMetric, COSTERAAppShell } from "@/components/app/COSTERAAppShell";

import { getAppLocale, tx } from "@/lib/costera/i18n";

const expenses = [
 ["Payroll","$12,800","87"],
 ["Rent","$8,500","58"],
 ["Delivery fees","$4,488","31"],
 ["Utilities","$1,940","13"],
 ["Other operating","$3,260","22"],
];

export default async function FinancePage(){
 const locale = await getAppLocale();
 return (
  <COSTERAAppShell active="/dashboard/finance" locale={locale} title={tx(locale,"Finance","Finans")}>
   <div className="costera-metrics five">
    <AppMetric label="Net Sales" value="$58,240" meta="Sep 1–22" tone="good" />
    <AppMetric label="COGS" value="$17,124" meta="29.4% of sales" tone="bad" />
    <AppMetric label="Gross Profit" value="$41,116" meta="70.6% gross margin" tone="good" />
    <AppMetric label="Operating Expenses" value="$30,988" meta="53.2% of sales" />
    <AppMetric label="Estimated Net Profit" value="$10,128" meta="17.4% net margin" tone="good" />
   </div>

   <section className="costera-grid finance-layout">
    <article className="costera-panel span-2">
     <div className="costera-panel-head"><div><span>MANAGEMENT P&L</span><h2>Month-to-date profitability</h2></div><button>Add accounting expense</button></div>
     <div className="costera-pnl">
      <div className="total"><span>Net Sales</span><b>$58,240</b></div>
      <div><span>Food COGS</span><b>-$17,124</b></div>
      <div className="subtotal"><span>Gross Profit</span><b>$41,116</b></div>
      {expenses.map(r=><div key={r[0]}><span>{r[0]}</span><b>-{r[1]}</b></div>)}
      <div className="profit"><span>Estimated Net Profit</span><b>$10,128</b></div>
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>COST MIX</span><h2>Where the money goes</h2></div></div>
     <div className="costera-expense-bars">
      {expenses.map(r=><div key={r[0]}><p><span>{r[0]}</span><b>{r[1]}</b></p><i><em className={"bar-"+r[2]} /></i></div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
