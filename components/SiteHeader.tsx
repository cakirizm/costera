import Link from "next/link";
import { Brand } from "./Brand";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand-link"><Brand /></Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <div className="header-actions">
          <Link className="text-link" href="/login">Sign In</Link>
          <Link className="button button-gold button-small" href="/demo">Request Demo</Link>
        </div>
      </div>
    </header>
  );
}
