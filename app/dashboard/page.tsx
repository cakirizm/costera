import { AppMetric, COSTERAAppShell, StatusPill } from "@/components/app/COSTERAAppShell";

const varianceRows = [
  ["Minced Beef","+17 kg","$561","22.6%","High"],
  ["Chicken Breast","+11 kg","$176","7.1%","High"],
  ["Olive Oil","+4 L","$52","2.1%","Medium"],
  ["Mozzarella","+3 kg","$39","1.6%","Medium"],
];

const channelRows = [
  ["Dine-in","$26,820","28.1%","22.4%"],
  ["Talabat","$12,640","31.9%","14.2%"],
  ["Deliveroo","$9,450","35.8%","8.1%"],
  ["Careem","$5,240","33.1%","10.8%"],
];

export default function DashboardPage(){
 return (
  <COSTERAAppShell active="/dashboard" title="Overview">
   <div className="costera-alert-strip">
    <div>
      <i>!</i>
      <p>
        <strong>$2,480 unexplained cost requires review</strong>
        <span>Minced Beef, Chicken Breast and Olive Oil account for 31.8% of the current gap.</span>
      </p>
    </div>
    <a href="/dashboard/variance">Open Cost Control →</a>
   </div>

   <div className="costera-metrics five">
    <AppMetric label="Net Sales" value="$58,240" meta="+8.3% vs previous period" tone="good" />
    <AppMetric label="Target Food Cost" value="25.0%" meta="Configured group target" tone="gold" />
    <AppMetric label="Actual Food Cost" value="29.4%" meta="+4.4 pp above target" tone="bad" />
    <AppMetric label="Unexplained Variance" value="$2,480" meta="4.3% of net sales" tone="bad" />
    <AppMetric label="Gross Margin" value="62.1%" meta="+3.2 pp vs prior period" tone="good" />
   </div>

   <section className="costera-grid overview-grid">
    <article className="costera-panel span-2">
      <div className="costera-panel-head">
        <div><span>FOOD COST TREND</span><h2>Actual vs target</h2></div>
        <div className="costera-legend"><i className="actual"/>Actual<i className="target"/>Target</div>
      </div>
      <div className="costera-line-chart">
        <div className="costera-target-line" />
        <svg viewBox="0 0 700 250" preserveAspectRatio="none">
          <path d="M0 192 C66 135,115 166,172 118 S285 150,350 98 S465 139,535 85 S632 98,700 58" fill="none" stroke="#0a2b45" strokeWidth="7" strokeLinecap="round"/>
        </svg>
        <div className="costera-chart-labels"><span>Sep 1</span><span>Sep 7</span><span>Sep 14</span><span>Sep 21</span></div>
      </div>
    </article>

    <article className="costera-panel">
      <div className="costera-panel-head"><div><span>UNEXPLAINED COST</span><h2>Variance mix</h2></div></div>
      <div className="costera-donut-wrap">
        <div className="costera-donut"><div><strong>$2.48k</strong><small>Total gap</small></div></div>
        <div className="costera-donut-legend">
          <span><i className="v1"/>Meat & Poultry<b>$1,320</b></span>
          <span><i className="v2"/>Dairy<b>$420</b></span>
          <span><i className="v3"/>Oils<b>$310</b></span>
          <span><i className="v4"/>Other<b>$430</b></span>
        </div>
      </div>
    </article>
   </section>

   <section className="costera-grid overview-bottom-grid">
    <article className="costera-panel span-2">
      <div className="costera-panel-head">
        <div><span>TOP VARIANCES</span><h2>Ingredients requiring attention</h2></div>
        <a href="/dashboard/variance">View analysis</a>
      </div>
      <div className="costera-table overview-table">
        <div className="costera-table-row head"><span>Ingredient</span><span>Difference</span><span>Impact</span><span>Share of gap</span><span>Risk</span></div>
        {varianceRows.map(r=><div className="costera-table-row" key={r[0]}>{r.map((c,i)=><span key={i} className={i===1||i===2?"negative":""}>{i===4?<StatusPill tone={c==="High"?"bad":"warning"}>{c}</StatusPill>:c}</span>)}</div>)}
      </div>
    </article>

    <article className="costera-panel">
      <div className="costera-panel-head"><div><span>CHANNEL PROFITABILITY</span><h2>Sales channel economics</h2></div><a href="/dashboard/delivery">Open delivery</a></div>
      <div className="costera-channel-list">
        {channelRows.map(r=><div key={r[0]}>
          <p><strong>{r[0]}</strong><span>{r[1]}</span></p>
          <p><small>Food Cost</small><b>{r[2]}</b></p>
          <p><small>Net Margin</small><b className="positive">{r[3]}</b></p>
        </div>)}
      </div>
    </article>
   </section>
  </COSTERAAppShell>
 )
}
