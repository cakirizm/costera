import Link from "next/link";
import { DashboardMock } from "@/components/DashboardMock";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const pillars = [
  {
    icon: "◫",
    title: "Smart Inventory Control",
    text: "Follow stock movement, purchases and counts while highlighting unexplained differences.",
  },
  {
    icon: "≋",
    title: "Theoretical vs. Actual Usage",
    text: "Compare recipe-driven expected consumption with real usage by ingredient and period.",
  },
  {
    icon: "▥",
    title: "Delivery Channel Visibility",
    text: "See revenue, cost and profitability across direct sales and delivery channels in one place.",
  },
  {
    icon: "▣",
    title: "Access Anywhere",
    text: "Review the same clear management view from desktop, tablet or mobile.",
  },
];

const steps = [
  {
    no: "1",
    title: "POS and delivery data flows in",
    text: "Sales and order data are collected automatically from connected sources.",
    visual: "channels",
  },
  {
    no: "2",
    title: "Menu items are linked to recipes",
    text: "Each sold item is connected to the ingredients and quantities it should consume.",
    visual: "recipe",
  },
  {
    no: "3",
    title: "Stock movement is understood",
    text: "Purchases, transfers, waste and counts are brought into the same operating model.",
    visual: "stock",
  },
  {
    no: "4",
    title: "Expected and actual usage are compared",
    text: "COSTERA calculates what should have been used and compares it with real consumption.",
    visual: "compare",
  },
  {
    no: "5",
    title: "Unexplained variance is isolated",
    text: "Known adjustments are separated from quantity and value that still need review.",
    visual: "variance",
  },
  {
    no: "6",
    title: "Management sees what needs attention",
    text: "A simple mobile-ready view shows where cost, stock or recipe performance is drifting.",
    visual: "mobile",
  },
];

const benefits = [
  ["Time Saved", "Less manual consolidation and spreadsheet work."],
  ["Lower Cost Leakage", "Spot unusual consumption before it becomes normal."],
  ["Clearer Operations", "One consistent view across stock, recipes and sales."],
  ["Faster Decisions", "See the issue, the value and the period in one place."],
  ["Stronger Margins", "Protect profitability with better cost visibility."],
];

function StepVisual({ type }: { type: string }) {
  if (type === "channels") {
    return (
      <div className="step-visual channel-visual">
        <span>POS</span><span>DELIVERY</span><span>API</span>
      </div>
    );
  }
  if (type === "recipe") {
    return (
      <div className="step-visual recipe-visual">
        <div className="food-circle">◎</div>
        <ul>
          <li>Chicken 120 g</li><li>Lettuce 80 g</li><li>Sauce 30 g</li>
        </ul>
      </div>
    );
  }
  if (type === "stock") {
    return (
      <div className="step-visual stock-visual">
        <span>Stock In</span><span>Purchase</span><span>Waste</span>
      </div>
    );
  }
  if (type === "compare") {
    return (
      <div className="step-visual compare-visual">
        <div><small>Expected</small><strong>$8,420</strong></div>
        <div><small>Actual</small><strong>$9,680</strong></div>
      </div>
    );
  }
  if (type === "variance") {
    return (
      <div className="step-visual variance-visual">
        <small>Unexplained Variance</small>
        <strong>$1,260</strong>
        <span>Chicken +18%</span><span>Olive Oil +22%</span>
      </div>
    );
  }
  return (
    <div className="step-visual mobile-visual">
      <div className="phone-mini">
        <small>Today</small><strong>$8,320</strong><span>Food Cost 28.9%</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader locale="en" />
      <main>
        <section className="hero hero-reference">
          <div className="hero-photo-layer" />
          <div className="shell hero-reference-grid">
            <div className="hero-copy hero-reference-copy">
              <div className="eyebrow">SMART COST CONTROL FOR RESTAURANTS</div>
              <h1>
                Connect your kitchen to data.
                <span> Keep profitability under control.</span>
              </h1>
              <p>
                COSTERA brings POS, recipes, inventory, purchasing and delivery
                channels into one operating view. It helps you identify unexplained
                stock variance and keep food cost under control.
              </p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/demo">Request Demo <span>→</span></Link>
                <Link className="button button-outline play-button" href="/how-it-works">
                  <span className="play-icon">▶</span> How It Works
                </Link>
              </div>
              <div className="trust-row">
                <span>Fast setup</span>
                <span>Works with your existing systems</span>
                <span>Designed for restaurant operations</span>
              </div>
            </div>
            <div className="hero-product-stage">
              <DashboardMock locale="en" />
              <span className="hero-script-note">Built for better restaurant decisions.</span>
            </div>
          </div>
        </section>

        <section className="section why-section">
          <div className="shell why-layout">
            <div className="why-intro">
              <div className="eyebrow">WHY COSTERA?</div>
              <h2>Less leakage.<br/>More margin.</h2>
              <p>
                See restaurant operations from end to end and keep control where it matters most.
              </p>
            </div>
            <div className="why-cards">
              {pillars.map((item) => (
                <article className="why-card" key={item.title}>
                  <span className="why-icon">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="section-signature">CONTROL COSTS. GROW PROFIT.</div>
        </section>

        <section className="section soft-section how-preview-section">
          <div className="shell section-heading split-title">
            <div>
              <div className="eyebrow">SIMPLE INTEGRATION. STRONGER CONTROL.</div>
              <h2>How COSTERA turns restaurant data into action.</h2>
            </div>
            <p>
              Existing systems keep running as usual. COSTERA reads, validates and
              interprets the data, then brings the important exceptions to the surface.
            </p>
          </div>

          <div className="shell six-step-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.no}>
                <span className="step-badge">{step.no}</span>
                <StepVisual type={step.visual} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>

          <div className="shell benefits-strip">
            <div className="benefit-lead">
              <span>MORE THAN REPORTING</span>
              <strong>Practical control<br/>for daily operations.</strong>
            </div>
            {benefits.map(([title, text]) => (
              <div className="benefit-item" key={title}>
                <span className="benefit-icon">✓</span>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="section product-detail-section">
          <div className="shell product-detail-heading">
            <div>
              <div className="eyebrow">EVERYTHING IN ONE OPERATING VIEW</div>
              <h2>Control the processes that shape your food cost.</h2>
            </div>
            <p>
              COSTERA connects stock, recipes, purchasing, sales and delivery data so
              cost movement becomes visible instead of being discovered after month-end.
            </p>
          </div>

          <div className="shell product-module-grid">
            <article className="module-showcase">
              <span className="module-icon">◫</span>
              <h3>Inventory Control</h3>
              <p>See stock on hand, unit cost and quantity differences.</p>
              <div className="mini-table">
                <div><span>Beef Tenderloin</span><b>12.5 kg</b><em>$18.40</em></div>
                <div><span>Mozzarella</span><b>8.0 kg</b><em>$6.20</em></div>
                <div><span>Tomatoes</span><b>4.0 kg</b><em>$2.10</em></div>
              </div>
            </article>

            <article className="module-showcase">
              <span className="module-icon">≋</span>
              <h3>Recipe & Food Cost</h3>
              <p>Track recipe cost and target food-cost performance.</p>
              <div className="recipe-panel">
                <div className="dish-photo">◎</div>
                <div><strong>Truffle Pasta</strong><span>Recipe cost $4.21</span><span>Target 28.0%</span><b>Actual 34.5%</b></div>
              </div>
            </article>

            <article className="module-showcase">
              <span className="module-icon">▥</span>
              <h3>Purchasing</h3>
              <p>Understand supplier cost movement and purchase impact.</p>
              <div className="purchase-list">
                <span>Metro <b>$1,240</b></span>
                <span>Bidfood <b>$980</b></span>
                <span>Fresh Supply <b>$640</b></span>
              </div>
            </article>

            <article className="module-showcase">
              <span className="module-icon">▦</span>
              <h3>Delivery Channel Analysis</h3>
              <p>Compare direct and delivery channel economics side by side.</p>
              <div className="channel-table">
                <span>Dine-in <b>22.4%</b></span>
                <span>Delivery <b>12.1%</b></span>
                <span>Takeaway <b>18.7%</b></span>
              </div>
            </article>

            <article className="module-showcase wide-module">
              <span className="module-icon">◎</span>
              <h3>Theoretical vs. Actual Consumption</h3>
              <p>Compare recipe-driven usage with the stock that actually moved.</p>
              <div className="variance-table">
                <div><span>Chicken Breast</span><b>50.0 kg</b><b>62.8 kg</b><em>+25.6%</em></div>
                <div><span>Olive Oil</span><b>18.0 L</b><b>21.4 L</b><em>+18.9%</em></div>
                <div><span>Mozzarella</span><b>20.0 kg</b><b>18.2 kg</b><i>-9.0%</i></div>
              </div>
            </article>

            <article className="module-showcase mobile-module">
              <span className="module-icon">▣</span>
              <h3>Mobile Management View</h3>
              <p>Review the key numbers from anywhere without opening technical setup screens.</p>
              <div className="phone-card">
                <span>Today</span><strong>$6,240</strong><small>Food Cost 28.9%</small>
              </div>
            </article>

            <article className="module-showcase alert-module">
              <span className="module-icon">△</span>
              <h3>Alerts & Exception Monitoring</h3>
              <p>Bring unusual consumption, target breaches and integration issues to the surface.</p>
              <div className="alert-list">
                <span>Chicken usage 25.6% above expected.</span>
                <span>Truffle Pasta food cost is above target.</span>
                <span>Mozzarella stock is approaching minimum level.</span>
              </div>
            </article>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-cta-photo" />
          <div className="shell final-cta-inner">
            <div>
              <div className="eyebrow eyebrow-light">START WITH BETTER VISIBILITY</div>
              <h2>More control in the kitchen.<br/><span>More margin in the business.</span></h2>
            </div>
            <div className="final-cta-copy">
              <p>
                Make cost movement visible, review the exceptions and keep your
                restaurant operation easier to control.
              </p>
              <div>
                <Link className="button button-gold" href="/demo">Request Demo <span>→</span></Link>
                <Link className="button button-ghost" href="/how-it-works">How It Works</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
