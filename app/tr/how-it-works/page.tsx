import Link from "next/link";
import { DashboardMock } from "@/components/DashboardMock";
import { HowProcess } from "@/components/HowProcess";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const benefits = [
  ["Zaman Kazandırır", "Manuel veri toplama ve Excel işini azaltır."],
  ["Kaçağı Azaltır", "Olağandışı tüketimi normalleşmeden önce fark edin."],
  ["Şeffaflık Sağlar", "Stok, reçete ve satışları tek tutarlı görünümde birleştirir."],
  ["Daha Hızlı Karar", "Sorunu ve parasal etkisini rapor aramadan görün."],
  ["Marjı Korur", "Daha iyi cost görünürlüğüyle kârlılığı koruyun."],
];

export default function TurkishHowItWorksPage() {
  return (
    <>
      <SiteHeader locale="tr" path="/how-it-works" />
      <main>
        <section className="inner-hero visual-hero">
          <div className="inner-hero-photo" />
          <div className="shell visual-hero-grid">
            <div className="inner-hero-copy">
              <div className="eyebrow">BASİT ENTEGRASYON. GÜÇLÜ SONUÇLAR.</div>
              <h1>COSTERA restoran maliyetini nasıl kontrol altında tutar?</h1>
              <p>
                Mevcut sistemleriniz çalışmaya devam eder. COSTERA operasyon verisini toplar,
                doğrular ve farkları yöneticinin kolay anlayacağı bir görünüme dönüştürür.
              </p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/tr/demo">Demo İste <span>→</span></Link>
                <Link className="button button-outline" href="/tr/features">Özellikleri Gör</Link>
              </div>
            </div>
            <div className="inner-dashboard"><DashboardMock locale="tr" /></div>
          </div>
        </section>

        <section className="section">
          <div className="shell how-title-row">
            <div>
              <div className="eyebrow">6 ADIMDA DAHA NET MALİYET KONTROLÜ</div>
              <h2>POS verisinden yönetim sonucuna kadar.</h2>
            </div>
            <p>Hızlı kurulum. Gerçek veri. Net istisnalar.</p>
          </div>
          <div className="shell"><HowProcess locale="tr" /></div>
        </section>

        <section className="section soft-section">
          <div className="shell benefits-feature-row">
            <div className="benefits-heading">
              <div className="eyebrow">SADECE ANALİZ DEĞİL</div>
              <h2>Günlük operasyon için gerçek fayda.</h2>
            </div>
            {benefits.map(([title, text]) => (
              <div className="benefit-feature" key={title}>
                <span>✓</span><strong>{title}</strong><p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="how-bottom-cta">
          <div className="how-bottom-photo" />
          <div className="shell how-bottom-inner">
            <div>
              <div className="eyebrow eyebrow-light">BUGÜN BAŞLAYIN</div>
              <h2>Mutfakta daha fazla görünürlük.<br/><span>İşletmede daha fazla kontrol.</span></h2>
            </div>
            <div>
              <p>Bir şubeyi bağlayın, veriyi doğrulayın ve güvenle büyütün.</p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/tr/demo">Demo İste</Link>
                <Link className="button button-ghost" href="/tr/pricing">Fiyatlandırmayı Gör</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
