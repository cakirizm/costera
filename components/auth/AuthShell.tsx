import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SiteLanguageSwitcher } from "@/components/SiteLanguageSwitcher";
import { translateArabic, localePath, type AppLocale } from "@/lib/costera/locale";

export function AuthShell({
  locale = "en",
  eyebrow,
  title,
  subtitle,
  visualTitle,
  visualText,
  children,
}: {
  locale?: AppLocale;
  eyebrow: string;
  title: string;
  subtitle: string;
  visualTitle: string;
  visualText: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand-row">
          <Link href={localePath(locale)} className="auth-brand"><Brand light /></Link>
          <SiteLanguageSwitcher locale={locale} path="/login" />
        </div>
        <div className="auth-visual-copy">
          <div className="eyebrow eyebrow-light">{locale === "ar" ? translateArabic("RESTAURANT COST INTELLIGENCE") : "RESTAURANT COST INTELLIGENCE"}</div>
          <h1>{visualTitle}</h1>
          <p>{visualText}</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
