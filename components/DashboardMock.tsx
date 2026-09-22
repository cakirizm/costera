const varianceRows = [
  ["Meat & Poultry", "$980", "+12.4%"],
  ["Dairy", "$420", "+5.1%"],
  ["Oils", "$310", "+3.8%"],
  ["Other", "$770", "+2.1%"],
];

export function DashboardMock({ locale = "en" }: { locale?: "en" | "tr" }) {
  const tr = locale === "tr";
  return (
    <div className="product-laptop" aria-label="COSTERA dashboard preview">
      <div className="laptop-camera" />
      <div className="laptop-screen">
        <div className="dashboard-mock">
          <div className="mock-topbar">
            <div className="mock-brand">
              <span className="mock-brand-mark">C</span>
              <strong>COSTERA</strong>
            </div>
            <span className="mock-period">{tr ? "1 - 31 Mayıs" : "May 1 - 31"}</span>
          </div>
          <div className="mock-body">
            <aside className="mock-sidebar">
              <span className="active">{tr ? "Genel Bakış" : "Overview"}</span>
              <span>{tr ? "Stok" : "Inventory"}</span>
              <span>{tr ? "Reçeteler" : "Recipes"}</span>
              <span>{tr ? "Satın Alma" : "Purchasing"}</span>
              <span>{tr ? "Satış & POS" : "Sales & POS"}</span>
              <span>Delivery</span>
              <span>{tr ? "Raporlar" : "Reports"}</span>
            </aside>

            <section className="mock-content">
              <div className="mock-title-row">
                <div>
                  <small>{tr ? "Tüm Şubeler" : "All locations"}</small>
                  <h3>{tr ? "Genel Bakış" : "Overview"}</h3>
                </div>
                <span className="live-pill">{tr ? "Canlı" : "Live"}</span>
              </div>

              <div className="mock-kpis">
                <article>
                  <small>{tr ? "Toplam Satış" : "Total Sales"}</small>
                  <strong>$58,240</strong>
                  <span className="success-text">+8.3%</span>
                </article>
                <article>
                  <small>{tr ? "Hedef Food Cost" : "Target Food Cost"}</small>
                  <strong>25.0%</strong>
                  <span className="success-text">{tr ? "Hedefte" : "On target"}</span>
                </article>
                <article>
                  <small>{tr ? "Gerçek Food Cost" : "Actual Food Cost"}</small>
                  <strong>29.4%</strong>
                  <span className="danger-text">+4.4 pp</span>
                </article>
                <article>
                  <small>{tr ? "Açıklanamayan Fark" : "Unexplained Variance"}</small>
                  <strong>$2,480</strong>
                  <span className="danger-text">+12.0%</span>
                </article>
              </div>

              <div className="mock-lower">
                <div className="chart-card">
                  <div className="card-heading">
                    <div>
                      <span>{tr ? "Food Cost Trendi" : "Food Cost Trend"}</span>
                      <small>{tr ? "Gerçek vs. hedef" : "Actual vs target"}</small>
                    </div>
                    <div className="chart-legend">
                      <i className="legend-line actual" />{tr ? "Gerçek" : "Actual"}
                      <i className="legend-line target" />{tr ? "Hedef" : "Target"}
                    </div>
                  </div>
                  <div className="chart-area">
                    <div className="target-line" />
                    <svg viewBox="0 0 420 150" preserveAspectRatio="none">
                      <path d="M0 122 C42 83,80 116,121 78 S198 99,247 60 S327 88,420 39" fill="none" stroke="#173f63" strokeWidth="5" strokeLinecap="round"/>
                    </svg>
                    <div className="chart-axis">
                      <span>1</span><span>8</span><span>15</span><span>22</span><span>31</span>
                    </div>
                  </div>
                </div>

                <div className="variance-card">
                  <div className="card-heading">
                    <div>
                      <span>{tr ? "En Yüksek Kayıplar" : "Largest Variances"}</span>
                      <small>{tr ? "Bu ay" : "This month"}</small>
                    </div>
                  </div>
                  <div className="variance-donut-row">
                    <div className="mini-donut">
                      <div><strong>$2.48k</strong><small>{tr ? "Toplam" : "Total"}</small></div>
                    </div>
                    <div className="mini-legend">
                      {varianceRows.map(([name, value, percent], index) => (
                        <span key={name}><i className={`dot dot-${index + 1}`} />{name}<b>{value}</b><em>{percent}</em></span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="channel-strip">
                <span>{tr ? "Restoran İçi" : "Dine-in"}<b>68.4%</b></span>
                <span>{tr ? "Paket Servis" : "Delivery"}<b>52.1%</b></span>
                <span>{tr ? "Takeaway" : "Takeaway"}<b>61.7%</b></span>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="laptop-base"><div /></div>
    </div>
  );
}
