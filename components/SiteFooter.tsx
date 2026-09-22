import Link from "next/link";
import { Brand } from "./Brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p className="footer-copy">
            Restaurant cost intelligence built for clearer control, cleaner data
            and stronger margins.
          </p>
        </div>
        <div>
          <h4>Product</h4>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div>
          <h4>Access</h4>
          <Link href="/login">Sign In</Link>
          <Link href="/demo">Request Demo</Link>
          <Link href="/dashboard">Dashboard Preview</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 COSTERA. All rights reserved.</span>
        <span>Built for modern restaurant operations.</span>
      </div>
    </footer>
  );
}
