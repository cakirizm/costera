import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const plans = [
  {
    name: "Starter",
    price: "$99",
    note: "For independent restaurants starting with structured cost control.",
    features: ["1 location", "Up to 5 users", "POS integration", "Recipe & cost engine", "Inventory variance", "Core reports", "Responsive web access", "Email support"],
  },
  {
    name: "Growth",
    price: "$249",
    note: "For growing restaurant groups that need branch-level visibility.",
    popular: true,
    features: ["Up to 3 locations", "Up to 25 users", "POS integration across locations", "Recipe & cost engine", "Inventory variance", "Delivery analytics", "Advanced reporting", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "For larger groups with custom data, integration and control requirements.",
    features: ["Unlimited locations", "Custom user structure", "Advanced integrations", "Advanced cost engine", "Detailed stock & waste analysis", "Custom KPI reporting", "Dedicated implementation", "Customer success support"],
  },
];

const faq = [
  ["Which plan is right for my restaurant?", "Starter is designed for a single location. Growth is a better fit for multi-location teams. Enterprise is scoped for larger groups and custom integration requirements."],
  ["How long does setup take?", "Setup time depends on your POS, stock and recipe data. COSTERA starts with a compatibility check, then validates the data before the restaurant goes live."],
  ["Is there a long-term commitment?", "Commercial terms can be adapted by plan and implementation scope. The final agreement is confirmed before onboarding."],
  ["Can pricing change with integration complexity?", "Yes. Native connectors are simpler to deploy. Custom POS, ERP or local bridge work may be scoped separately."],
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader locale="en" path="/pricing" />
      <main>
        <section className="pricing-visual-hero">
          <div className="pricing-hero-photo" />
          <div className="shell pricing-visual-grid">
            <div>
              <div className="eyebrow">PLANS FOR MORE PROFITABLE RESTAURANTS</div>
              <h1>Choose the plan that fits your operation.</h1>
              <p>
                Start with the level of control you need today and expand as your restaurant group grows.
                Final pricing can vary depending on integration requirements.
              </p>
              <div className="trust-row"><span>No unnecessary complexity</span><span>Structured onboarding</span><span>Clear implementation scope</span></div>
            </div>
            <div className="pricing-hero-quote">
              <strong>Better data.</strong>
              <strong>Better decisions.</strong>
              <strong>Stronger margins.</strong>
            </div>
          </div>
        </section>

        <section className="pricing-plans-section">
          <div className="shell pricing-grid reference-pricing-grid">
            {plans.map((plan) => (
              <article className={`pricing-card ${plan.popular ? "popular" : ""}`} key={plan.name}>
                {plan.popular && <div className="popular-label">MOST POPULAR</div>}
                <h2>{plan.name}</h2>
                <p>{plan.note}</p>
                <div className="price">{plan.price}{plan.price.startsWith("$") && <span>/ month</span>}</div>
                <Link className={`button ${plan.popular ? "button-gold" : "button-outline"} full-button`} href="/demo">
                  {plan.name === "Enterprise" ? "Contact Sales" : "Request Demo"} <span>→</span>
                </Link>
                <ul className="plan-list">{plan.features.map((item) => <li key={item}>✓ {item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section pricing-faq-section">
          <div className="shell pricing-faq-grid">
            <div>
              <div className="eyebrow">FREQUENTLY ASKED QUESTIONS</div>
              <h2>Clear answers before you start.</h2>
              <p>Pricing is only one part of implementation. Integration readiness and data quality are reviewed before go-live.</p>
              <Link className="button button-outline" href="/demo">Talk to Us <span>→</span></Link>
            </div>
            <div className="faq-list">
              {faq.map(([q,a]) => (
                <details key={q}>
                  <summary>{q}<span>+</span></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            <aside className="pricing-help-card">
              <span className="pricing-help-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></span>
              <h3>Not sure yet?</h3>
              <p>We can review your current POS, stock and branch structure before you choose a plan.</p>
              <Link className="button button-outline full-button" href="/demo">Request a Free Review <span>→</span></Link>
            </aside>
          </div>
        </section>

        <section className="pricing-bottom-banner">
          <div className="shell">
            <div>
              <div className="eyebrow eyebrow-light">START WITH THE RIGHT SETUP</div>
              <h2>Less cost leakage. More control.</h2>
              <p>See where COSTERA fits before committing to a rollout.</p>
            </div>
            <div className="hero-actions">
              <Link className="button button-gold" href="/demo">Request Demo</Link>
              <Link className="button button-ghost" href="/how-it-works">How It Works</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
