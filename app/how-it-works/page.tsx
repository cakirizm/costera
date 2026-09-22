import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  ["Connect your operational data", "COSTERA connects to POS and, where available, inventory, purchasing and delivery sources. Existing systems remain the operational source of truth."],
  ["Synchronize menu and recipes", "Menu items are matched to recipes so each sale can be translated into expected ingredient consumption."],
  ["Read stock movement", "Opening stock, purchases, transfers, approved waste and closing counts form the actual usage picture."],
  ["Calculate theoretical usage", "Sales volume is multiplied by recipe quantities to calculate what each ingredient should have consumed."],
  ["Compare actual and expected", "COSTERA identifies the gap between real stock usage and theoretical consumption, after approved adjustments."],
  ["Show the value of the gap", "Variance is converted into quantity and money so managers can review the ingredients and periods that need attention."],
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero page-hero-photo">
          <div className="shell narrow">
            <div className="eyebrow">HOW IT WORKS</div>
            <h1>Simple integration. Clear cost control.</h1>
            <p>
              COSTERA does not replace the way your restaurant operates. It reads,
              validates and interprets operational data to give you a cleaner view
              of cost and stock performance.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="shell process-list">
            {steps.map(([title, copy], i) => (
              <article className="process-item" key={title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{title}</h2>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section soft-section">
          <div className="shell two-col">
            <div>
              <div className="eyebrow">CONTROL WITHOUT DUPLICATION</div>
              <h2>Your team keeps working in the systems they already know.</h2>
            </div>
            <div className="copy-stack">
              <p>
                Sales continue to be entered in the POS. Purchases continue to be
                recorded in the restaurant&apos;s existing purchasing or inventory
                system where available.
              </p>
              <p>
                COSTERA sits above those systems, normalizes their data and focuses
                attention on exceptions instead of asking teams to re-enter the same
                information.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell action-banner">
            <div>
              <h2>See the workflow with your own restaurant data.</h2>
              <p>Start with one branch, validate the data, then scale.</p>
            </div>
            <Link className="button button-gold" href="/demo">Request Demo</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
