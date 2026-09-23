import { tx } from "@/lib/costera/locale";
const varianceRows = [
  ["Meat & Poultry", "$980", "+12.4%"],
  ["Dairy", "$420", "+5.1%"],
  ["Oils", "$310", "+3.8%"],
  ["Other", "$770", "+2.1%"],
];

export function DashboardMock({ locale = "en" }: { locale?: "en" | "tr" | "ar" }) {
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
            <span className="mock-period">{tx(locale, "May 1 - 31", "1 - 31 Mayıs")}</span>
          </div>
          <div className="mock-body">
            <aside className="mock-sidebar">
              <span className="active">{tx(locale, "Overview", "Genel Bakış")}</span>
              <span>{tx(locale, "Inventory", "Stok")}</span>
              <span>{tx(locale, "Recipes", "Reçeteler")}</span>
              <span>{tx(locale, "Purchasing", "Satın Alma")}</span>
              <span>{tx(locale, "Sales & POS", "Satış & POS")}</span>
              <span>{tx(locale, "Delivery", "Delivery")}</span>
              <span>{tx(locale, "Reports", "Raporlar")}</span>
            </aside>

            <section className="mock-content">
              <div className="mock-title-row">
                <div>
                  <small>{tx(locale, "All locations", "Tüm Şubeler")}</small>
                  <h3>{tx(locale, "Overview", "Genel Bakış")}</h3>
                </div>
                <span className="live-pill">{tx(locale, "Live", "Canlı")}</span>
              </div>

              <div className="mock-kpis">
                <article>
                  <small>{tx(locale, "Total Sales", "Toplam Satış")}</small>
                  <strong>$58,240</strong>
                  <span className="success-text">+8.3%</span>
                </article>
                <article>
                  <small>{tx(locale, "Target Food Cost", "Hedef Food Cost")}</small>
                  <strong>25.0%</strong>
                  <span className="success-text">{tx(locale, "On target", "Hedefte")}</span>
                </article>
                <article>
                  <small>{tx(locale, "Actual Food Cost", "Gerçek Food Cost")}</small>
                  <strong>29.4%</strong>
                  <span className="danger-text">+4.4 pp</span>
                </article>
                <article>
                  <small>{tx(locale, "Unexplained Variance", "Açıklanamayan Fark")}</small>
                  <strong>$2,480</strong>
                  <span className="danger-text">+12.0%</span>
                </article>
              </div>

              <div className="mock-lower">
                <div className="chart-card">
                  <div className="card-heading">
                    <div>
                      <span>{tx(locale, "Food Cost Trend", "Food Cost Trendi")}</span>
                      <small>{tx(locale, "Actual vs target", "Gerçek vs. hedef")}</small>
                    </div>
                    <div className="chart-legend">
                      <i className="legend-line actual" />{tx(locale, "Actual", "Gerçek")}
                      <i className="legend-line target" />{tx(locale, "Target", "Hedef")}
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
                      <span>{tx(locale, "Largest Variances", "En Yüksek Kayıplar")}</span>
                      <small>{tx(locale, "This month", "Bu ay")}</small>
                    </div>
                  </div>
                  <div className="variance-donut-row">
                    <div className="mini-donut">
                      <div><strong>$2.48k</strong><small>{tx(locale, "Total", "Toplam")}</small></div>
                    </div>
                    <div className="mini-legend">
                      {varianceRows.map(([name, value, percent], index) => (
                        <span key={name}><i className={`dot dot-${index + 1}`} />{tx(locale, name, name)}<b>{value}</b><em>{percent}</em></span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="channel-strip">
                <span>{tx(locale, "Dine-in", "Restoran İçi")}<b>68.4%</b></span>
                <span>{tx(locale, "Delivery", "Paket Servis")}<b>52.1%</b></span>
                <span>{tx(locale, "Takeaway", "Takeaway")}<b>61.7%</b></span>
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="laptop-base"><div /></div>
    </div>
  );
}
