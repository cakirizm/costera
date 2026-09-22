import Link from "next/link";
import { DashboardMock } from "@/components/DashboardMock";
import { HowProcess } from "@/components/HowProcess";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const benefits = [
  ["Time Saved", "Reduce manual consolidation and spreadsheet work."],
  ["Lower Cost Leakage", "Spot unusual usage before it becomes normal."],
  ["Clearer Operations", "Bring stock, recipes and sales into one consistent view."],
  ["Faster Decisions", "See the issue and its financial impact without digging through reports."],
  ["Stronger Margins", "Protect profitability with better cost visibility."],
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader locale="en" path="/how-it-works" />
      <main>
        <section className="inner-hero visual-hero">
          <div className="inner-hero-photo" />
          <div className="shell visual-hero-grid">
            <div className="inner-hero-copy">
              <div className="eyebrow">SIMPLE INTEGRATION. STRONGER RESULTS.</div>
              <h1>How COSTERA keeps restaurant cost under control.</h1>
              <p>
                Your systems keep running as usual. COSTERA collects the operational data,
                validates it and turns the differences into a clear management view.
              </p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/demo">Request Demo <span>→</span></Link>
                <Link className="button button-outline" href="/features">Explore Features</Link>
              </div>
            </div>
            <div className="inner-dashboard"><DashboardMock locale="en" /></div>
          </div>
        </section>

        <section className="section">
          <div className="shell how-title-row">
            <div>
              <div className="eyebrow">6 STEPS TO CLEARER COST CONTROL</div>
              <h2>From POS data to a management-ready result.</h2>
            </div>
            <p>Fast setup. Real data. Clear exceptions.</p>
          </div>
          <div className="shell"><HowProcess locale="en" /></div>
        </section>

        <section className="section soft-section">
          <div className="shell benefits-feature-row">
            <div className="benefits-heading">
              <div className="eyebrow">MORE THAN ANALYSIS</div>
              <h2>Practical value for daily operations.</h2>
            </div>
            {benefits.map(([title, text]) => (
              <div className="benefit-feature" key={title}>
                <span>✓</span><strong>{title}</strong><p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="how-bottom-cta">
          <div className="how-bottom-photo" />
          <div className="shell how-bottom-inner">
            <div>
              <div className="eyebrow eyebrow-light">START TODAY</div>
              <h2>More visibility in the kitchen.<br/><span>More control in the business.</span></h2>
            </div>
            <div>
              <p>Connect one location, validate the data and expand with confidence.</p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/demo">Request Demo</Link>
                <Link className="button button-ghost" href="/pricing">View Pricing</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
