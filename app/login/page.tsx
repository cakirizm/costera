import { getRequestLocale } from "@/lib/costera/i18n";
import { translateArabic, localePath } from "@/lib/costera/locale";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SiteLanguageSwitcher } from "@/components/SiteLanguageSwitcher";
import { LoginForm } from "@/components/auth/AuthForms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const locale = await getRequestLocale();
  const label = (text: string) => locale === "ar" ? translateArabic(text) : text;
  const { reset } = await searchParams;
  return (
    <main className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand-row">
          <Link href={localePath(locale)} className="auth-brand"><Brand light /></Link>
          <SiteLanguageSwitcher locale={locale} path="/login" />
        </div>
        <div className="auth-visual-copy">
          <div className="eyebrow eyebrow-light">{label("RESTAURANT COST INTELLIGENCE")}</div>
          <h1>{label("One clear view of cost, stock and variance.")}</h1>
          <p>{label("Secure access for restaurant owners, managers and operational teams.")}</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">{label("SIGN IN")}</div>
          <h2>{label("Welcome back.")}</h2>
          <p>{label("Use your COSTERA account to access your restaurant workspace.")}</p>
          <LoginForm locale={locale} resetDone={reset === "1"} />
        </div>
      </div>
    </main>
  );
}
