import Link from "next/link";
import { Brand } from "./Brand";

type Locale = "en" | "tr";

const copy = {
  en: {
    desc: "Restaurant cost intelligence for clearer control, cleaner data and stronger margins.",
    product: "Product",
    how: "How It Works",
    features: "Features",
    pricing: "Pricing",
    access: "Access",
    login: "Sign In",
    demo: "Request Demo",
    dashboard: "Dashboard Preview",
    rights: "All rights reserved.",
    note: "Built for modern restaurant operations.",
  },
  tr: {
    desc: "Daha net kontrol, daha temiz veri ve daha güçlü marjlar için restoran maliyet zekâsı.",
    product: "Ürün",
    how: "Nasıl Çalışır?",
    features: "Özellikler",
    pricing: "Fiyatlandırma",
    access: "Erişim",
    login: "Giriş Yap",
    demo: "Demo İste",
    dashboard: "Panel Önizleme",
    rights: "Tüm hakları saklıdır.",
    note: "Modern restoran operasyonları için tasarlandı.",
  },
};

export function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  const prefix = locale === "tr" ? "/tr" : "";

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p className="footer-copy">{t.desc}</p>
        </div>
        <div>
          <h4>{t.product}</h4>
          <Link href={`${prefix}/how-it-works`}>{t.how}</Link>
          <Link href={`${prefix}/features`}>{t.features}</Link>
          <Link href={`${prefix}/pricing`}>{t.pricing}</Link>
        </div>
        <div>
          <h4>{t.access}</h4>
          <Link href={`${prefix}/login`}>{t.login}</Link>
          <Link href={`${prefix}/demo`}>{t.demo}</Link>
          <Link href="/dashboard">{t.dashboard}</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 COSTERA. {t.rights}</span>
        <span>{t.note}</span>
      </div>
    </footer>
  );
}
