import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function POSPage(){
 const locale = await getAppLocale();
 const rows = [
  [tx(locale,"Dine-in","Restoran İçi"),"1,840","$26,820","98.6%","mapped"],
  ["Talabat","714","$12,640","97.2%","mapped"],
  ["Deliveroo","508","$9,450","94.8%","unmapped"],
  ["Careem","276","$5,240","100%","mapped"],
 ];

 return (
  <COSTERAAppShell active="/dashboard/pos" locale={locale} title={tx(locale,"Sales & POS","Satış & POS")}>
   <div className="costera-metrics four">
    <AppMetric label={tx(locale,"Orders","Siparişler")} value="3,338" meta={tx(locale,"+9.1% vs prior period","Önceki döneme göre +%9.1")} tone="good" />
    <AppMetric label={tx(locale,"Net Sales","Net Satış")} value="$58,240" meta={tx(locale,"Across all channels","Tüm kanallar")} />
    <AppMetric label={tx(locale,"Mapped Items","Eşleşen Ürünler")} value="97.8%" meta={tx(locale,"6 items need mapping","6 ürün eşleştirme bekliyor")} tone="gold" />
    <AppMetric label={tx(locale,"Voids & Discounts","İptal & İndirim")} value="$1,920" meta={tx(locale,"3.3% of gross sales","Brüt satışın %3.3'ü")} tone="bad" />
   </div>
   <section className="costera-grid">
    <article className="costera-panel span-3">
     <div className="costera-panel-head"><div><span>{tx(locale,"SALES FEED","SATIŞ AKIŞI")}</span><h2>{tx(locale,"Channel mapping & completeness","Kanal eşleştirme & veri bütünlüğü")}</h2></div><button>{tx(locale,"Sync now","Şimdi senkronla")}</button></div>
     <div className="costera-table">
      <div className="costera-table-row head"><span>{tx(locale,"Channel","Kanal")}</span><span>{tx(locale,"Orders","Siparişler")}</span><span>{tx(locale,"Sales","Satış")}</span><span>{tx(locale,"Mapping","Eşleştirme")}</span><span>{tx(locale,"Status","Durum")}</span></div>
      {rows.map(r=><div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i}>{i===4?<StatusPill tone={c==="mapped"?"good":"warning"}>{c==="mapped"?tx(locale,"Mapped","Eşleşti"):tx(locale,"3 unmapped","3 eşleşmedi")}</StatusPill>:c}</span>)}</div>)}
     </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
