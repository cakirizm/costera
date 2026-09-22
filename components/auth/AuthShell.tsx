import Link from "next/link";
import { Brand } from "@/components/Brand";
import { TurkeyFlag } from "@/components/Flags";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  visualTitle,
  visualText,
  children,
}: {
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
          <Link href="/" className="auth-brand"><Brand light /></Link>
          <Link href="/tr/login" className="language-switch language-switch-flag auth-language"><TurkeyFlag /><span>TR</span></Link>
        </div>
        <div className="auth-visual-copy">
          <div className="eyebrow eyebrow-light">RESTAURANT COST INTELLIGENCE</div>
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
