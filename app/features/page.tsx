import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const modules = [
  ["Theoretical vs Actual Usage", "Compare recipe-driven expected consumption with actual stock usage by ingredient, location and period."],
  ["Unexplained Stock Variance", "Separate approved waste and known adjustments from unexplained quantity and value differences."],
  ["Live Recipe Cost", "Recalculate recipe cost as ingredient purchase costs change and compare against target food-cost percentages."],
  ["Inventory Visibility", "Follow opening stock, receipts, transfers, counts and usage in one consistent operational model."],
  ["Purchase Cost Tracking", "See supplier price movement and understand which menu items are most affected."],
  ["Delivery Channel Economics", "Compare revenue, discounts, fees, food cost and contribution by delivery channel where data is available."],
  ["Multi-Branch Comparison", "Review cost and variance by branch while keeping each location&apos;s operational context."],
  ["Exception Monitoring", "Focus on unmatched menu items, missing recipes, unit mismatches, unusual stock gaps and integration issues."],
  ["Mobile Management View", "Give managers a clean mobile view of the numbers that need attention without exposing technical setup screens."],
];

export default function FeaturesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="shell narrow">
            <div className="eyebrow">FEATURES</div>
            <h1>Cost intelligence built around restaurant operations.</h1>
            <p>
              Every module supports one core objective: understand what entered
              stock, what should have been consumed, what was actually consumed
              and where the difference came from.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="shell module-grid">
            {modules.map(([title, copy], i) => (
              <article className="module-card" key={title}>
                <span className="module-index">0{i + 1}</span>
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section soft-section">
          <div className="shell two-col">
            <div>
              <div className="eyebrow">FLEXIBLE BY DESIGN</div>
              <h2>Different restaurant. Same control logic.</h2>
            </div>
            <div className="copy-stack">
              <p>
                Every restaurant can use different POS, purchasing, stock and
                accounting systems. COSTERA standardizes incoming data without
                forcing every business into the same operational process.
              </p>
              <p>
                Targets, units, recipe logic, allocation choices and branch rules
                can be configured per business while the core cost engine remains
                consistent.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell centered-cta">
            <Link className="button button-gold" href="/demo">See COSTERA in action</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
