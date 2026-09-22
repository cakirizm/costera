import { Brand } from "@/components/Brand";
import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="demo-page">
      <div className="shell demo-topbar">
        <Link href="/"><Brand /></Link>
        <div className="demo-top-actions">
          <Link href="/tr/demo" className="language-switch">TR</Link>
          <Link href="/" className="text-link">Back to website</Link>
        </div>
      </div>
      <div className="shell demo-grid">
        <section>
          <div className="eyebrow">REQUEST A DEMO</div>
          <h1>See COSTERA with your restaurant workflow.</h1>
          <p>
            Tell us how your restaurant currently handles POS, stock and recipes.
            We&apos;ll use that context to show the most relevant setup.
          </p>
          <div className="demo-points">
            <span>✓ Cost & variance workflow</span>
            <span>✓ POS and inventory integration review</span>
            <span>✓ Branch and recipe setup discussion</span>
          </div>
        </section>
        <form className="demo-form">
          <label>Full name<input placeholder="Your name" /></label>
          <label>Work email<input type="email" placeholder="name@restaurant.com" /></label>
          <label>Restaurant / group<input placeholder="Restaurant name" /></label>
          <label>Number of locations<select defaultValue="1"><option>1</option><option>2-3</option><option>4-10</option><option>10+</option></select></label>
          <label>Current POS<input placeholder="POS provider, if known" /></label>
          <button className="button button-gold full-button" type="button">Request Demo</button>
          <small>Demo request form is in preview mode during this test deployment.</small>
        </form>
      </div>
    </main>
  );
}
