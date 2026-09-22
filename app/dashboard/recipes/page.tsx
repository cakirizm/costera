import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

import { getAppLocale, tx } from "@/lib/costera/i18n";

const recipes = [
  ["Truffle Pasta","$4.21","28.0%","34.5%","+6.5 pp","Above target"],
  ["Chicken Caesar","$3.06","25.0%","27.2%","+2.2 pp","Watch"],
  ["Classic Burger","$3.84","27.0%","26.3%","-0.7 pp","Healthy"],
  ["Margherita Pizza","$2.31","24.0%","23.7%","-0.3 pp","Healthy"],
  ["Steak Frites","$8.64","31.0%","35.8%","+4.8 pp","Above target"],
];

export default async function RecipesPage(){
 const locale = await getAppLocale();
 return <COSTERAAppShell active="/dashboard/recipes" locale={locale} title={tx(locale,"Recipes & Food Cost","Reçeteler & Food Cost")}>
  <div className="costera-metrics five">
   <AppMetric label="Menu Items" value="84" meta="78 mapped to recipes" />
   <AppMetric label="Missing Recipes" value="6" meta="Needs mapping" tone="bad" />
   <AppMetric label="Target Food Cost" value="25.0%" meta="Group target" tone="gold" />
   <AppMetric label="Weighted Actual" value="29.4%" meta="+4.4 pp above target" tone="bad" />
   <AppMetric label="Recipe Price Updates" value="12" meta="Supplier prices changed" tone="gold" />
  </div>
  <section className="costera-grid recipes-layout">
   <article className="costera-panel span-2">
    <div className="costera-panel-head"><div><span>MENU COSTING</span><h2>Recipe performance</h2></div><button>+ New recipe</button></div>
    <div className="costera-table recipe-table">
     <div className="costera-table-row head"><span>Menu item</span><span>Recipe cost</span><span>Target FC</span><span>Actual FC</span><span>Variance</span><span>Status</span></div>
     {recipes.map(r=><div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i} className={i===4&&c.startsWith("+")?"negative":""}>{i===5?<StatusPill tone={c==="Healthy"?"good":c==="Watch"?"warning":"bad"}>{c}</StatusPill>:c}</span>)}</div>)}
    </div>
   </article>
   <article className="costera-panel">
    <div className="costera-panel-head"><div><span>SMART ACTIONS</span><h2>Margin opportunities</h2></div></div>
    <div className="costera-recommendations">
      <div><b>01</b><p><strong>Truffle Pasta</strong><span>Reduce portion cost by $0.48 or raise selling price by $1.75 to return to target.</span></p></div>
      <div><b>02</b><p><strong>Steak Frites</strong><span>Beef purchase cost increased 8.2% this month.</span></p></div>
      <div><b>03</b><p><strong>6 products</strong><span>Sales exist but recipe mapping is missing.</span></p></div>
    </div>
   </article>
  </section>
 </COSTERAAppShell>
}
