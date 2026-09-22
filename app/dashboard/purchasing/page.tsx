import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function PurchasingPage(){
 const locale = await getAppLocale();
 const rows = [
  ["Metro",tx(locale,"Beef Tenderloin","Dana Bonfile"),"$18.40","$19.90","+8.2%","review"],
  ["Bidfood",tx(locale,"Chicken Breast","Tavuk Göğsü"),"$4.82","$5.12","+6.2%","watch"],
  ["Fresh Supply","Avocado","$7.40","$6.95","-6.1%","good"],
  ["Gulf Foods",tx(locale,"Olive Oil","Zeytinyağı"),"$12.20","$13.00","+6.6%","watch"],
 ];
 const status=(s:string)=>s==="good"?tx(locale,"Good","İyi"):s==="watch"?tx(locale,"Watch","İzle"):tx(locale,"Review","İncele");

 return (
  <COSTERAAppShell active="/dashboard/purchasing" locale={locale} title={tx(locale,"Purchasing","Satın Alma")}>
   <div className="costera-metrics four">
    <AppMetric label={tx(locale,"Purchases MTD","Aylık Satın Alma")} value="$14,720" meta={tx(locale,"+5.4% vs previous period","Önceki döneme göre +%5.4")} />
    <AppMetric label={tx(locale,"Supplier Price Increases","Tedarikçi Fiyat Artışları")} value="9" meta={tx(locale,"Affecting 21 recipes","21 reçeteyi etkiliyor")} tone="bad" />
    <AppMetric label={tx(locale,"Largest Increase","En Büyük Artış")} value="+8.2%" meta={tx(locale,"Beef Tenderloin","Dana Bonfile")} tone="bad" />
    <AppMetric label={tx(locale,"Potential Savings","Tasarruf Potansiyeli")} value="$690" meta={tx(locale,"Based on alternate pricing","Alternatif fiyatlara göre")} tone="good" />
   </div>
   <section className="costera-grid purchasing-grid">
    <article className="costera-panel span-3">
      <div className="costera-panel-head"><div><span>{tx(locale,"SUPPLIER PRICE MOVEMENT","TEDARİKÇİ FİYAT HAREKETİ")}</span><h2>{tx(locale,"Cost changes affecting recipes","Reçeteleri etkileyen maliyet değişimleri")}</h2></div><button>{tx(locale,"Import purchase file","Satın alma dosyası aktar")}</button></div>
      <div className="costera-table">
       <div className="costera-table-row head"><span>{tx(locale,"Supplier","Tedarikçi")}</span><span>{tx(locale,"Ingredient","Malzeme")}</span><span>{tx(locale,"Previous","Önceki")}</span><span>{tx(locale,"Current","Güncel")}</span><span>{tx(locale,"Change","Değişim")}</span><span>{tx(locale,"Status","Durum")}</span></div>
       {rows.map(r=><div className="costera-table-row" key={r[1]}>{r.map((c,i)=><span key={i} className={i===4&&c.startsWith("+")?"negative":""}>{i===5?<StatusPill tone={c==="good"?"good":c==="watch"?"warning":"bad"}>{status(c)}</StatusPill>:c}</span>)}</div>)}
      </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
