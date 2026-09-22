import { AppMetric, COSTERAAppShell } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function FinancePage(){
 const locale = await getAppLocale();
 const expenses = [
  [tx(locale,"Payroll","Personel"),"$12,800","87"],
  [tx(locale,"Rent","Kira"),"$8,500","58"],
  [tx(locale,"Delivery fees","Delivery ücretleri"),"$4,488","31"],
  [tx(locale,"Utilities","Genel giderler"),"$1,940","13"],
  [tx(locale,"Other operating","Diğer operasyon"),"$3,260","22"],
 ];

 return (
  <COSTERAAppShell active="/dashboard/finance" locale={locale} title={tx(locale,"Finance","Finans")}>
   <div className="costera-metrics five">
    <AppMetric label={tx(locale,"Net Sales","Net Satış")} value="$58,240" meta="Sep 1–22" tone="good" />
    <AppMetric label="COGS" value="$17,124" meta={tx(locale,"29.4% of sales","Satışların %29.4'ü")} tone="bad" />
    <AppMetric label={tx(locale,"Gross Profit","Brüt Kâr")} value="$41,116" meta={tx(locale,"70.6% gross margin","%70.6 brüt marj")} tone="good" />
    <AppMetric label={tx(locale,"Operating Expenses","Operasyon Giderleri")} value="$30,988" meta={tx(locale,"53.2% of sales","Satışların %53.2'si")} />
    <AppMetric label={tx(locale,"Estimated Net Profit","Tahmini Net Kâr")} value="$10,128" meta={tx(locale,"17.4% net margin","%17.4 net marj")} tone="good" />
   </div>

   <section className="costera-grid finance-layout">
    <article className="costera-panel span-2">
     <div className="costera-panel-head"><div><span>{tx(locale,"MANAGEMENT P&L","YÖNETİM P&L")}</span><h2>{tx(locale,"Month-to-date profitability","Ay başından bugüne kârlılık")}</h2></div><button>{tx(locale,"Add accounting expense","Muhasebe gideri ekle")}</button></div>
     <div className="costera-pnl">
      <div className="total"><span>{tx(locale,"Net Sales","Net Satış")}</span><b>$58,240</b></div>
      <div><span>{tx(locale,"Food COGS","Yiyecek COGS")}</span><b>-$17,124</b></div>
      <div className="subtotal"><span>{tx(locale,"Gross Profit","Brüt Kâr")}</span><b>$41,116</b></div>
      {expenses.map(r=><div key={r[0]}><span>{r[0]}</span><b>-{r[1]}</b></div>)}
      <div className="profit"><span>{tx(locale,"Estimated Net Profit","Tahmini Net Kâr")}</span><b>$10,128</b></div>
     </div>
    </article>

    <article className="costera-panel">
     <div className="costera-panel-head"><div><span>{tx(locale,"COST MIX","MALİYET DAĞILIMI")}</span><h2>{tx(locale,"Where the money goes","Para nereye gidiyor")}</h2></div></div>
     <div className="costera-expense-bars">
      {expenses.map(r=><div key={r[0]}><p><span>{r[0]}</span><b>{r[1]}</b></p><i><em className={"bar-"+r[2]} /></i></div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
