import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const plans = [
  {
    name: "Starter",
    price: "$99",
    note: "For independent restaurants starting with structured cost control.",
    features: ["1 location", "Up to 5 users", "POS integration", "Recipe cost engine", "Inventory variance", "Monthly reports", "Responsive web access"],
  },
  {
    name: "Growth",
    price: "$249",
    note: "For growing restaurant groups that need branch-level visibility.",
    popular: true,
    features: ["Up to 3 locations", "Up to 25 users", "Multi-branch POS integration", "Recipe & cost engine", "Inventory variance", "Delivery analytics", "Trend reporting", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "For larger groups with custom data, integration and control requirements.",
    features: ["Unlimited locations", "Custom user structure", "Advanced integrations", "Custom reporting", "Dedicated onboarding", "Integration monitoring", "Priority implementation support"],
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader locale="en" path="/pricing" />
      <main>
        <section className="pricing-hero">
          <div className="shell narrow">
            <div className="eyebrow">PRICING</div>
            <h1>Choose the level of control your operation needs.</h1>
            <p>
              Start with a focused setup and expand as your restaurant group grows.
              Final pricing can vary based on integration requirements.
            </p>
          </div>
        </section>

        <section className="section pricing-section">
          <div className="shell pricing-grid">
            {plans.map((plan) => (
              <article className={`pricing-card ${plan.popular ? "popular" : ""}`} key={plan.name}>
                {plan.popular && <div className="popular-label">MOST POPULAR</div>}
                <h2>{plan.name}</h2>
                <p>{plan.note}</p>
                <div className="price">{plan.price}{plan.price.startsWith("$") && <span>/ month</span>}</div>
                <Link className={`button ${plan.popular ? "button-gold" : "button-outline"} full-button`} href="/demo">
                  {plan.name === "Enterprise" ? "Contact Sales" : "Request Demo"}
                </Link>
                <ul className="plan-list">
                  {plan.features.map((item) => <li key={item}>✓ {item}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <div className="shell pricing-note">
            <strong>Need something different?</strong>
            <span>Custom connector, rollout and dedicated deployment options can be scoped separately.</span>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
