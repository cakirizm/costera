import Link from "next/link";
import { Brand } from "@/components/Brand";
import { TurkeyFlag } from "@/components/Flags";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand-row">
          <Link href="/" className="auth-brand"><Brand light /></Link>
          <Link href="/tr/login" className="language-switch language-switch-flag auth-language"><TurkeyFlag /><span>TR</span></Link>
        </div>
        <div className="auth-visual-copy">
          <div className="eyebrow eyebrow-light">RESTAURANT COST INTELLIGENCE</div>
          <h1>One clear view of cost, stock and variance.</h1>
          <p>Secure access for restaurant owners, managers and operational teams.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">SIGN IN</div>
          <h2>Welcome back.</h2>
          <p>Use your COSTERA account to access your restaurant workspace.</p>
          <form action="/dashboard" className="auth-form">
            <label>Work email<input type="email" placeholder="name@restaurant.com" required /></label>
            <label>Password<input type="password" placeholder="••••••••" required /></label>
            <div className="auth-meta">
              <label className="check-label"><input type="checkbox" /> Remember me</label>
              <a href="#">Forgot password?</a>
            </div>
            <button className="button button-dark full-button" type="submit">Sign In</button>
          </form>
          <p className="auth-foot">Need access? Contact your COSTERA administrator.</p>
        </div>
      </div>
    </main>
  );
}
