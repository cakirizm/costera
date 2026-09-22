import Link from "next/link";
import { Brand } from "@/components/Brand";

const ingredients = [
  ["Minced Beef", "148 kg", "131 kg", "+17 kg", "$561"],
  ["Chicken Breast", "201 kg", "190 kg", "+11 kg", "$176"],
  ["Olive Oil", "44 L", "40 L", "+4 L", "$52"],
  ["Mozzarella", "76 kg", "73 kg", "+3 kg", "$39"],
];

export default function DashboardPage() {
  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Brand compact />
        <nav>
          <a className="active" href="#">Overview</a>
          <a href="#">Inventory</a>
          <a href="#">Recipes & Cost</a>
          <a href="#">Purchasing</a>
          <a href="#">POS & Sales</a>
          <a href="#">Delivery</a>
          <a href="#">Reports</a>
          <a href="#">Settings</a>
        </nav>
        <Link href="/" className="sidebar-exit">← Website</Link>
      </aside>
      <section className="app-main">
        <header className="app-topbar">
          <div>
            <small>Demo Restaurant Group</small>
            <h1>Overview</h1>
          </div>
          <div className="topbar-controls">
            <select defaultValue="all"><option value="all">All locations</option></select>
            <button>May 1–31</button>
            <div className="avatar">JD</div>
          </div>
        </header>

        <div className="app-kpis">
          <article><span>Sales</span><strong>$58,240</strong><small className="success-text">+8.3%</small></article>
          <article><span>Target Food Cost</span><strong>25.0%</strong><small>Configured target</small></article>
          <article><span>Actual Food Cost</span><strong>29.4%</strong><small className="danger-text">+4.4 pp</small></article>
          <article className="alert-kpi"><span>Unexplained Variance</span><strong>$2,480</strong><small className="danger-text">Review required</small></article>
        </div>

        <div className="app-grid">
          <article className="app-card chart-large">
            <div className="card-heading"><div><strong>Food Cost Trend</strong><small>Actual vs target</small></div><span>May</span></div>
            <div className="big-chart">
              <div className="chart-target" />
              <svg viewBox="0 0 700 250" preserveAspectRatio="none"><path d="M0 190 C70 130,120 177,190 108 S330 160,390 98 S520 145,700 55" fill="none" stroke="#0a2740" strokeWidth="7" strokeLinecap="round"/></svg>
            </div>
          </article>
          <article className="app-card">
            <div className="card-heading"><div><strong>Variance by Category</strong><small>Unexplained value</small></div></div>
            <div className="donut-wrap">
              <div className="donut"><span>$2.48k<small>Total</small></span></div>
              <div className="legend">
                <span><i className="dot d1"/>Meat & Poultry <b>$1,320</b></span>
                <span><i className="dot d2"/>Dairy <b>$420</b></span>
                <span><i className="dot d3"/>Oils <b>$310</b></span>
                <span><i className="dot d4"/>Other <b>$430</b></span>
              </div>
            </div>
          </article>
        </div>

        <article className="app-card table-card">
          <div className="card-heading">
            <div><strong>Largest Ingredient Variances</strong><small>Actual usage compared with recipe-driven theoretical usage</small></div>
            <button className="table-action">View full analysis</button>
          </div>
          <div className="data-table">
            <div className="data-row table-head"><span>Ingredient</span><span>Actual Usage</span><span>Theoretical</span><span>Difference</span><span>Value</span></div>
            {ingredients.map((row) => <div className="data-row" key={row[0]}>{row.map((cell, i) => <span className={i > 2 ? "danger-text" : ""} key={i}>{cell}</span>)}</div>)}
          </div>
        </article>
      </section>
    </main>
  );
}
