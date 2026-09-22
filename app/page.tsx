import Link from "next/link";
import { DashboardMock } from "@/components/DashboardMock";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const workflow = [
  ["1", "Connect sales channels", "POS and delivery data flow into one controlled view."],
  ["2", "Map menu and recipes", "Each menu item is linked to the ingredients it should consume."],
  ["3", "Read stock movement", "Purchases, transfers, waste and counts are brought into context."],
  ["4", "Compare expected vs actual", "COSTERA calculates what should have been used and what was actually used."],
  ["5", "Find unexplained variance", "Material gaps are translated into quantity, value and operational impact."],
  ["6", "Act with clarity", "Managers see where to review cost, stock and recipe performance."],
];

const capabilities = [
  ["Inventory Control", "Track stock movement, counts and unexplained quantity differences."],
  ["Recipe & Food Cost", "Calculate recipe cost automatically and compare it with your target food cost."],
  ["Purchasing Insight", "Understand purchase price changes and their impact on menu profitability."],
  ["Delivery Visibility", "Compare direct sales and delivery-channel economics in one place."],
  ["Variance Analysis", "See theoretical consumption against actual usage by ingredient and period."],
  ["Mobile Access", "Open the same clear view from desktop, tablet or phone."],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-image" />
          <div className="hero-overlay" />
          <div className="shell hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">RESTAURANT COST INTELLIGENCE</div>
              <h1>
                Turn restaurant data into
                <span> controlled costs.</span>
              </h1>
              <p>
                COSTERA connects POS, recipes, inventory, purchasing and delivery
                data to show where cost is moving, where stock is drifting and
                where action is needed.
              </p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/demo">Request Demo</Link>
                <Link className="button button-outline" href="/how-it-works">See How It Works</Link>
              </div>
              <div className="trust-row">
                <span>Fast setup</span>
                <span>Works with existing systems</span>
                <span>Built for restaurant operations</span>
              </div>
            </div>
            <div className="hero-dashboard">
              <DashboardMock />
            </div>
          </div>
        </section>

        <section className="section section-tight">
          <div className="shell split-heading">
            <div>
              <div className="eyebrow">WHY COSTERA</div>
              <h2>Less guesswork. More control.</h2>
            </div>
            <p>
              Instead of adding another manual reporting task, COSTERA interprets
              the data your restaurant already generates and turns it into a
              focused cost-control view.
            </p>
          </div>
          <div className="shell capability-grid">
            {capabilities.map(([title, copy]) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon">{title.slice(0,1)}</div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section soft-section">
          <div className="shell section-heading center">
            <div className="eyebrow">HOW IT WORKS</div>
            <h2>From raw transactions to clear cost control.</h2>
            <p>
              COSTERA follows the flow of your operation, then compares what should
              have happened with what actually happened.
            </p>
          </div>
          <div className="shell workflow-grid">
            {workflow.map(([n, title, copy]) => (
              <article className="workflow-card" key={n}>
                <span className="step-number">{n}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <div className="shell centered-cta">
            <Link className="button button-dark" href="/how-it-works">Explore the full workflow</Link>
          </div>
        </section>

        <section className="section">
          <div className="shell product-showcase">
            <div>
              <div className="eyebrow">A CLEARER OPERATING VIEW</div>
              <h2>See what should be happening before cost gets away from you.</h2>
              <p>
                Review food cost, stock variance, recipe performance and channel
                economics by day, week, month or custom date range.
              </p>
              <div className="metric-list">
                <div><strong>25.0%</strong><span>Target food cost</span></div>
                <div><strong>29.4%</strong><span>Actual food cost</span></div>
                <div><strong>$2,480</strong><span>Unexplained variance</span></div>
              </div>
              <Link className="text-cta" href="/features">Explore features →</Link>
            </div>
            <div className="showcase-panel">
              <DashboardMock />
            </div>
          </div>
        </section>

        <section className="section dark-section">
          <div className="shell dark-cta">
            <div>
              <div className="eyebrow eyebrow-light">BUILT FOR BETTER DECISIONS</div>
              <h2>Control costs without adding complexity.</h2>
              <p>
                Connect the systems you already use, validate the data and give
                your team one consistent view of restaurant cost performance.
              </p>
            </div>
            <div className="dark-cta-actions">
              <Link className="button button-gold" href="/demo">Request Demo</Link>
              <Link className="button button-ghost" href="/pricing">View Pricing</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
