import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";
import { getAppLocale, tx } from "@/lib/costera/i18n";

export default async function RecipesPage(){
 const locale = await getAppLocale();
 const recipes = [
  ["Truffle Pasta","$4.21","28.0%","34.5%","+6.5 pp","above"],
  ["Chicken Caesar","$3.06","25.0%","27.2%","+2.2 pp","watch"],
  ["Classic Burger","$3.84","27.0%","26.3%","-0.7 pp","healthy"],
  ["Margherita Pizza","$2.31","24.0%","23.7%","-0.3 pp","healthy"],
  ["Steak Frites","$8.64","31.0%","35.8%","+4.8 pp","above"],
 ];
 const status=(s:string)=>s==="healthy"?tx(locale,"Healthy","Sağlıklı"):s==="watch"?tx(locale,"Watch","İzle"):tx(locale,"Above target","Hedef üstü");

 return <COSTERAAppShell active="/dashboard/recipes" locale={locale} title={tx(locale,"Recipes & Food Cost","Reçeteler & Food Cost")}>
  <div className="costera-metrics five">
   <AppMetric label={tx(locale,"Menu Items","Menü Ürünleri")} value="84" meta={tx(locale,"78 mapped to recipes","78 ürün reçeteye bağlı")} />
   <AppMetric label={tx(locale,"Missing Recipes","Eksik Reçeteler")} value="6" meta={tx(locale,"Needs mapping","Eşleştirme gerekli")} tone="bad" />
   <AppMetric label={tx(locale,"Target Food Cost","Hedef Food Cost")} value="25.0%" meta={tx(locale,"Group target","Grup hedefi")} tone="gold" />
   <AppMetric label={tx(locale,"Weighted Actual","Ağırlıklı Gerçek")} value="29.4%" meta={tx(locale,"+4.4 pp above target","Hedefin +4.4 puan üzerinde")} tone="bad" />
   <AppMetric label={tx(locale,"Recipe Price Updates","Reçete Fiyat Güncellemeleri")} value="12" meta={tx(locale,"Supplier prices changed","Tedarikçi fiyatları değişti")} tone="gold" />
  </div>
  <section className="costera-grid recipes-layout">
   <article className="costera-panel span-2">
    <div className="costera-panel-head"><div><span>{tx(locale,"MENU COSTING","MENÜ MALİYETİ")}</span><h2>{tx(locale,"Recipe performance","Reçete performansı")}</h2></div><button>+ {tx(locale,"New recipe","Yeni reçete")}</button></div>
    <div className="costera-table recipe-table">
     <div className="costera-table-row head"><span>{tx(locale,"Menu item","Menü ürünü")}</span><span>{tx(locale,"Recipe cost","Reçete maliyeti")}</span><span>{tx(locale,"Target FC","Hedef FC")}</span><span>{tx(locale,"Actual FC","Gerçek FC")}</span><span>{tx(locale,"Variance","Fark")}</span><span>{tx(locale,"Status","Durum")}</span></div>
     {recipes.map(r=><div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i} className={i===4&&c.startsWith("+")?"negative":""}>{i===5?<StatusPill tone={c==="healthy"?"good":c==="watch"?"warning":"bad"}>{status(c)}</StatusPill>:c}</span>)}</div>)}
    </div>
   </article>
   <article className="costera-panel">
    <div className="costera-panel-head"><div><span>{tx(locale,"SMART ACTIONS","AKILLI AKSİYONLAR")}</span><h2>{tx(locale,"Margin opportunities","Marj fırsatları")}</h2></div></div>
    <div className="costera-recommendations">
      <div><b>01</b><p><strong>Truffle Pasta</strong><span>{tx(locale,"Reduce portion cost by $0.48 or raise selling price by $1.75 to return to target.","Hedefe dönmek için porsiyon maliyetini $0.48 azaltın veya satış fiyatını $1.75 artırın.")}</span></p></div>
      <div><b>02</b><p><strong>Steak Frites</strong><span>{tx(locale,"Beef purchase cost increased 8.2% this month.","Dana eti satın alma maliyeti bu ay %8.2 arttı.")}</span></p></div>
      <div><b>03</b><p><strong>6 {tx(locale,"products","ürün")}</strong><span>{tx(locale,"Sales exist but recipe mapping is missing.","Satış var ancak reçete eşleştirmesi eksik.")}</span></p></div>
    </div>
   </article>
  </section>
 </COSTERAAppShell>
}
