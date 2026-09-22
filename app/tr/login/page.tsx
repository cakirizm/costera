import Link from "next/link";
import { Brand } from "@/components/Brand";
import { UKFlag } from "@/components/Flags";

export default function TurkishLoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand-row">
          <Link href="/tr" className="auth-brand"><Brand light /></Link>
          <Link href="/login" className="language-switch language-switch-flag auth-language"><UKFlag /><span>EN</span></Link>
        </div>
        <div className="auth-visual-copy">
          <div className="eyebrow eyebrow-light">RESTORAN MALİYET ZEKÂSI</div>
          <h1>Cost, stok ve sapma için tek net görünüm.</h1>
          <p>Restoran sahipleri, yöneticiler ve operasyon ekipleri için güvenli erişim.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">GİRİŞ YAP</div>
          <h2>Tekrar hoş geldiniz.</h2>
          <p>Restoran çalışma alanınıza erişmek için COSTERA hesabınızı kullanın.</p>
          <form action="/dashboard" className="auth-form">
            <label>İş e-postası<input type="email" placeholder="isim@restoran.com" required /></label>
            <label>Şifre<input type="password" placeholder="••••••••" required /></label>
            <div className="auth-meta">
              <label className="check-label"><input type="checkbox" /> Beni hatırla</label>
              <a href="#">Şifremi unuttum</a>
            </div>
            <button className="button button-dark full-button" type="submit">Giriş Yap</button>
          </form>
          <p className="auth-foot">Erişim mi gerekli? COSTERA yöneticinizle iletişime geçin.</p>
        </div>
      </div>
    </main>
  );
}
