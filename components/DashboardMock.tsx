const rows = [
  ["Beef", "$980", "High"],
  ["Chicken", "$520", "Review"],
  ["Dairy", "$420", "Review"],
  ["Oil", "$310", "Normal"],
];

export function DashboardMock() {
  return (
    <div className="dashboard-mock">
      <div className="mock-topbar">
        <div className="mock-brand-dot" />
        <span>COSTERA</span>
        <span className="mock-period">May 1–31</span>
      </div>
      <div className="mock-body">
        <aside className="mock-sidebar">
          <span className="active">Overview</span>
          <span>Inventory</span>
          <span>Recipes</span>
          <span>Purchasing</span>
          <span>Sales</span>
          <span>Delivery</span>
        </aside>
        <div className="mock-content">
          <div className="mock-title-row">
            <div>
              <small>All locations</small>
              <h3>Cost Overview</h3>
            </div>
            <span className="live-pill">Live</span>
          </div>
          <div className="mock-kpis">
            <article>
              <small>Unexplained Variance</small>
              <strong>$2,480</strong>
              <span className="danger-text">+12.0%</span>
            </article>
            <article>
              <small>Target Food Cost</small>
              <strong>25.0%</strong>
              <span className="success-text">On target</span>
            </article>
            <article>
              <small>Actual Food Cost</small>
              <strong>29.4%</strong>
              <span className="danger-text">+4.4 pp</span>
            </article>
            <article>
              <small>Gross Margin</small>
              <strong>62.1%</strong>
              <span className="success-text">+3.2 pp</span>
            </article>
          </div>
          <div className="mock-lower">
            <div className="chart-card">
              <div className="card-heading">
                <span>Food Cost Trend</span>
                <small>Actual vs target</small>
              </div>
              <div className="chart-area">
                <div className="target-line" />
                <svg viewBox="0 0 420 150" preserveAspectRatio="none">
                  <path d="M0 120 C45 82,85 110,125 69 S205 91,250 58 S332 77,420 36" fill="none" stroke="#0a2740" strokeWidth="5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="variance-card">
              <div className="card-heading"><span>Largest Variances</span><small>This month</small></div>
              {rows.map(([name, value, status]) => (
                <div className="variance-row" key={name}>
                  <span>{name}</span><strong>{value}</strong><small>{status}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
