import { COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function ReportsPage(){
 const locale = await getAppLocale();
 const reports = [
  [tx(locale,"Daily Cost Pulse","Günlük Maliyet Nabzı"),tx(locale,"Today","Bugün"),tx(locale,"Food cost, sales, variance","Food cost, satış, fark"),"ready"],
  [tx(locale,"Weekly Leakage Review","Haftalık Kaçak İncelemesi"),"Sep 16–22",tx(locale,"Root causes & actions","Kök nedenler & aksiyonlar"),"ready"],
  [tx(locale,"Monthly Management P&L","Aylık Yönetim P&L"),tx(locale,"September","Eylül"),tx(locale,"Profitability summary","Kârlılık özeti"),"draft"],
  [tx(locale,"Delivery Settlement Reconciliation","Delivery Settlement Mutabakatı"),tx(locale,"September","Eylül"),tx(locale,"All connected delivery channels","Bağlı tüm delivery kanalları"),"review"],
 ];
 const status=(s:string)=>s==="ready"?tx(locale,"Ready","Hazır"):s==="draft"?tx(locale,"Draft","Taslak"):tx(locale,"Review","İncele");

 return (
  <COSTERAAppShell active="/dashboard/reports" locale={locale} title={tx(locale,"Reports","Raporlar")}>
   <section className="costera-grid">
    <article className="costera-panel span-3">
     <div className="costera-panel-head"><div><span>{tx(locale,"REPORT LIBRARY","RAPOR KÜTÜPHANESİ")}</span><h2>{tx(locale,"Management reports","Yönetim raporları")}</h2></div><button>+ {tx(locale,"Build report","Rapor oluştur")}</button></div>
     <div className="costera-report-grid">
      {reports.map(r=><div className="costera-report-card" key={r[0]}>
       <span>▦</span><h3>{r[0]}</h3><p>{r[2]}</p>
       <div><small>{r[1]}</small><StatusPill tone={r[3]==="ready"?"good":r[3]==="draft"?"neutral":"warning"}>{status(r[3])}</StatusPill></div>
      </div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
