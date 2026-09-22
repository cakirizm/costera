import Link from "next/link";
import { DashboardMock } from "@/components/DashboardMock";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const cards = [
  ["Inventory Control", "Track stock status, unit cost and unexplained quantity differences.", "inventory"],
  ["Recipe & Food Cost", "Recalculate recipe cost as purchase prices change and compare it with target food cost.", "recipe"],
  ["Purchasing", "See supplier cost movement and understand which menu items are affected.", "purchase"],
  ["Delivery Channel Analysis", "Compare direct sales and delivery-channel economics in one management view.", "delivery"],
  ["Theoretical vs. Actual Usage", "Compare recipe-driven expected usage with the stock that actually moved.", "variance"],
  ["Mobile Management View", "Review the numbers that need attention from desktop, tablet or phone.", "mobile"],
  ["Alerts & Exception Monitoring", "Surface unusual usage, target breaches, missing recipes and integration issues.", "alerts"],
];

function FeatureVisual({ type }: { type: string }) {
  if (type === "inventory") return <div className="feature-mini-table"><span>Beef <b>12.5 kg</b><em>$230</em></span><span>Mozzarella <b>8.0 kg</b><em>$49.60</em></span><span>Tomatoes <b>4.0 kg</b><em>$8.40</em></span></div>;
  if (type === "recipe") return <div className="feature-recipe"><div>◎</div><section><b>Truffle Pasta</b><span>Recipe Cost $4.21</span><span>Target 28.0%</span><em>Actual 34.5%</em></section></div>;
  if (type === "purchase") return <div className="feature-purchases"><span>Metro <b>$1,240</b></span><span>Bidfood <b>$980</b></span><span>Fresh Supply <b>$640</b></span></div>;
  if (type === "delivery") return <div className="feature-channel"><span>Dine-in <b>22.4%</b></span><span>Delivery <b>12.1%</b></span><span>Takeaway <b>18.7%</b></span></div>;
  if (type === "variance") return <div className="feature-variance"><span>Chicken <b>50.0</b><em>62.8</em><i>+25.6%</i></span><span>Olive Oil <b>18.0</b><em>21.4</em><i>+18.9%</i></span><span>Mozzarella <b>20.0</b><em>18.2</em><u>-9.0%</u></span></div>;
  if (type === "mobile") return <div className="feature-phone"><small>Today</small><strong>$6,240</strong><span>Food Cost 28.9%</span><b>Net Margin 17.5%</b></div>;
  return <div className="feature-alerts"><span>Chicken usage 25.6% above expected.</span><span>Truffle Pasta food cost is above target.</span><span>Mozzarella stock is near minimum.</span></div>;
}

export default function FeaturesPage() {
  return (
    <>
      <SiteHeader locale="en" path="/features" />
      <main>
        <section className="feature-hero">
          <div className="feature-hero-photo" />
          <div className="shell feature-hero-grid">
            <div>
              <div className="eyebrow">YOUR ENTIRE OPERATION IN ONE VIEW</div>
              <h1>Profitable restaurants are managed with data.</h1>
              <p>
                COSTERA makes cost movement visible across inventory, recipes, purchasing,
                sales and delivery channels so management can act before margin disappears.
              </p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/demo">Request Demo <span>→</span></Link>
                <Link className="button button-outline" href="/how-it-works">See How It Works</Link>
              </div>
              <div className="trust-row"><span>Real-time visibility</span><span>Easy control</span><span>Built for restaurants</span></div>
            </div>
            <div className="feature-hero-dashboard"><DashboardMock locale="en" /></div>
          </div>
        </section>

        <section className="section feature-section">
          <div className="shell feature-section-heading">
            <div>
              <div className="eyebrow">WHAT COSTERA CONTROLS</div>
              <h2>Keep the processes that shape your margins visible.</h2>
            </div>
            <p>
              COSTERA connects the operational signals behind food cost, stock variance
              and channel profitability in one consistent management view.
            </p>
          </div>

          <div className="shell feature-showcase-grid">
            {cards.map(([title, copy, type], index) => (
              <article className={`feature-showcase-card ${index === 4 || index === 6 ? "feature-wide" : ""}`} key={title}>
                <div className="feature-card-heading">
                  <span className="feature-card-icon">{String(index + 1).padStart(2,"0")}</span>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                </div>
                <FeatureVisual type={type} />
              </article>
            ))}
          </div>
        </section>

        <section className="proof-strip">
          <div className="shell proof-strip-inner">
            <div className="proof-quote">
              <div className="proof-avatar">JD</div>
              <p>
                “The value is not another report. It is seeing where cost is moving
                before the end of the month.”
              </p>
              <small>Operations Director · Multi-site Restaurant Group</small>
            </div>
            <div className="proof-stat"><strong>↓</strong><b>Clearer stock control</b><span>Across every connected location</span></div>
            <div className="proof-stat"><strong>24/7</strong><b>Management visibility</b><span>Desktop, tablet and mobile</span></div>
            <div className="proof-stat"><strong>1</strong><b>Operating view</b><span>Stock, recipes, sales and delivery</span></div>
          </div>
        </section>

        <section className="feature-bottom-cta">
          <div className="shell feature-bottom-inner">
            <div>
              <div className="eyebrow eyebrow-light">BUILD A MORE CONTROLLED OPERATION</div>
              <h2>Turn restaurant data into easier control.</h2>
              <p>Start with the data you already have and build from there.</p>
            </div>
            <div className="hero-actions">
              <Link className="button button-gold" href="/demo">Request Demo</Link>
              <Link className="button button-ghost" href="/pricing">View Pricing</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
