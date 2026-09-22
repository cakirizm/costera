import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

import { getAppLocale, tx } from "@/lib/costera/i18n";

const rows = [
  ["Minced Beef","148 kg","$8.42","$1,246","+17 kg","Review"],
  ["Chicken Breast","201 kg","$5.12","$1,029","+11 kg","Review"],
  ["Olive Oil","44 L","$13.00","$572","+4 L","Review"],
  ["Mozzarella","76 kg","$8.30","$631","+3 kg","Normal"],
  ["Tomatoes","94 kg","$2.10","$197","-2 kg","Normal"],
];

export default async function InventoryPage() {
  const locale = await getAppLocale();
  return (
    <COSTERAAppShell active="/dashboard/inventory" locale={locale} title={tx(locale,"Inventory","Stok")}>
      <div className="costera-metrics five">
        <AppMetric label="Stock Value" value="$18,420" meta="+2.4% vs last count" />
        <AppMetric label="Unexplained Qty" value="$1,128" meta="6.1% of stock value" tone="bad" />
        <AppMetric label="Critical Items" value="4" meta="Need review today" tone="bad" />
        <AppMetric label="Low Stock" value="7" meta="Below configured minimum" tone="gold" />
        <AppMetric label="Last Full Count" value="Sep 21" meta="22:14 · completed" tone="good" />
      </div>

      <section className="costera-grid inventory-layout">
        <article className="costera-panel span-2">
          <div className="costera-panel-head"><div><span>INVENTORY POSITION</span><h2>Current stock & variance</h2></div><button>Export</button></div>
          <div className="costera-table">
            <div className="costera-table-row head"><span>Ingredient</span><span>Qty</span><span>Unit cost</span><span>Value</span><span>Variance</span><span>Status</span></div>
            {rows.map(r => <div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i} className={i===4 && c.startsWith("+") ? "negative" : ""}>{i===5?<StatusPill tone={c==="Review"?"bad":"good"}>{c}</StatusPill>:c}</span>)}</div>)}
          </div>
        </article>
        <article className="costera-panel">
          <div className="costera-panel-head"><div><span>STOCK HEALTH</span><h2>What needs attention</h2></div></div>
          <div className="costera-action-list">
            <div><i className="red">!</i><p><strong>Minced Beef</strong><span>17 kg above theoretical usage</span></p><b>$561</b></div>
            <div><i className="red">!</i><p><strong>Chicken Breast</strong><span>11 kg unexplained</span></p><b>$176</b></div>
            <div><i className="gold">↓</i><p><strong>Avocado</strong><span>Below minimum level</span></p><b>6 kg</b></div>
            <div><i className="green">✓</i><p><strong>18 items</strong><span>Within expected range</span></p></div>
          </div>
        </article>
      </section>
    </COSTERAAppShell>
  );
}
