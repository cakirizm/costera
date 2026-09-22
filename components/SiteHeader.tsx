import Link from "next/link";
import { Brand } from "./Brand";

type Locale = "en" | "tr";

const copy = {
  en: {
    product: "Product",
    how: "How It Works",
    features: "Features",
    pricing: "Pricing",
    login: "Sign In",
    demo: "Request Demo",
    overview: "Overview",
    control: "Cost Control",
    integrations: "Integrations",
  },
  tr: {
    product: "Ürün",
    how: "Nasıl Çalışır?",
    features: "Özellikler",
    pricing: "Fiyatlandırma",
    login: "Giriş Yap",
    demo: "Demo İste",
    overview: "Genel Bakış",
    control: "Maliyet Kontrolü",
    integrations: "Entegrasyonlar",
  },
};

export function SiteHeader({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  const prefix = locale === "tr" ? "/tr" : "";
  const otherLocaleHref = locale === "tr" ? "/" : "/tr";

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href={prefix || "/"} className="brand-link" aria-label="COSTERA home">
          <Brand />
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          <div className="nav-dropdown">
            <Link href={`${prefix}/features`} className="nav-dropdown-trigger">
              {t.product}<span aria-hidden="true">⌄</span>
            </Link>
            <div className="nav-dropdown-menu">
              <Link href={prefix || "/"}>{t.overview}</Link>
              <Link href={`${prefix}/features`}>{t.control}</Link>
              <Link href={`${prefix}/how-it-works`}>{t.integrations}</Link>
            </div>
          </div>
          <Link href={`${prefix}/how-it-works`}>{t.how}</Link>
          <Link href={`${prefix}/features`}>{t.features}</Link>
          <Link href={`${prefix}/pricing`}>{t.pricing}</Link>
        </nav>

        <div className="header-actions">
          <Link href={otherLocaleHref} className="language-switch" aria-label="Change language">
            {locale === "tr" ? "EN" : "TR"}
          </Link>
          <Link className="text-link" href={`${prefix}/login`}>{t.login}</Link>
          <Link className="button button-gold button-small" href={`${prefix}/demo`}>{t.demo}<span>→</span></Link>
        </div>
      </div>
    </header>
  );
}
