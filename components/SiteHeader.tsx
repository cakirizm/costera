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

function ChevronDown() {
  return (
    <svg className="nav-chevron" viewBox="0 0 12 8" aria-hidden="true">
      <path d="M1.5 1.5 6 6l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TurkeyFlag() {
  return (
    <svg className="language-flag" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" rx="2" fill="#E30A17" />
      <circle cx="12" cy="10" r="5.2" fill="#fff" />
      <circle cx="13.8" cy="10" r="4.15" fill="#E30A17" />
      <path d="m18.2 10 1.45.47-.9-1.23v1.52l.9-1.23-1.45.47.9 1.23V9.71l-.9 1.23Z" fill="#fff" />
    </svg>
  );
}

function UKFlag() {
  return (
    <svg className="language-flag" viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" rx="2" fill="#012169" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#C8102E" strokeWidth="1.8" />
      <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.2" />
    </svg>
  );
}

function SwitchFlag({ locale }: { locale: Locale }) {
  return locale === "tr" ? <UKFlag /> : <TurkeyFlag />;
}

export function SiteHeader({
  locale = "en",
  path = "/",
}: {
  locale?: Locale;
  path?: string;
}) {
  const t = copy[locale];
  const prefix = locale === "tr" ? "/tr" : "";
  const cleanPath = path === "/" ? "" : path;
  const otherLocaleHref = locale === "tr" ? (cleanPath || "/") : `/tr${cleanPath}`;

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href={prefix || "/"} className="brand-link" aria-label="COSTERA home">
          <Brand />
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          <div className="nav-dropdown">
            <Link href={`${prefix}/features`} className={`nav-dropdown-trigger ${path === "/features" ? "active" : ""}`}>
              <span>{t.product}</span>
              <ChevronDown />
            </Link>
            <div className="nav-dropdown-menu">
              <Link href={prefix || "/"}>{t.overview}</Link>
              <Link href={`${prefix}/features`}>{t.control}</Link>
              <Link href={`${prefix}/how-it-works`}>{t.integrations}</Link>
            </div>
          </div>
          <Link className={path === "/how-it-works" ? "active" : ""} href={`${prefix}/how-it-works`}>{t.how}</Link>
          <Link className={path === "/features" ? "active" : ""} href={`${prefix}/features`}>{t.features}</Link>
          <Link className={path === "/pricing" ? "active" : ""} href={`${prefix}/pricing`}>{t.pricing}</Link>
        </nav>

        <div className="header-actions">
          <Link className="text-link" href={`${prefix}/login`}>{t.login}</Link>
          <Link className="button button-gold button-small desktop-demo" href={`${prefix}/demo`}>
            {t.demo}<span>→</span>
          </Link>
          <Link href={otherLocaleHref} className="language-switch language-switch-flag" aria-label="Change language">
            <SwitchFlag locale={locale} />
            <span>{locale === "tr" ? "EN" : "TR"}</span>
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Open menu"><span></span><span></span><span></span></summary>
            <div className="mobile-menu-panel">
              <Link href={`${prefix}/how-it-works`}>{t.how}</Link>
              <Link href={`${prefix}/features`}>{t.features}</Link>
              <Link href={`${prefix}/pricing`}>{t.pricing}</Link>
              <Link href={`${prefix}/login`}>{t.login}</Link>
              <Link href={otherLocaleHref} className="mobile-language">
                <SwitchFlag locale={locale} />
                {locale === "tr" ? "English" : "Türkçe"}
              </Link>
              <Link className="button button-gold full-button" href={`${prefix}/demo`}>{t.demo}</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
