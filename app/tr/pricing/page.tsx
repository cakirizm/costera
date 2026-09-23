import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const plans = [
  {
    name: "Starter",
    price: "$99",
    note: "Yapılandırılmış maliyet kontrolüne başlayan tek şubeli restoranlar için.",
    features: ["1 şube", "5 kullanıcıya kadar", "POS entegrasyonu", "Reçete & cost motoru", "Stok fark analizi", "Temel raporlar", "Mobil uyumlu web erişimi", "E-posta desteği"],
  },
  {
    name: "Growth",
    price: "$249",
    note: "Şube bazlı görünürlüğe ihtiyaç duyan büyüyen restoran grupları için.",
    popular: true,
    features: ["3 şubeye kadar", "25 kullanıcıya kadar", "Tüm şubelerde POS entegrasyonu", "Reçete & cost motoru", "Stok fark analizi", "Delivery analitiği", "Gelişmiş raporlar", "Öncelikli destek"],
  },
  {
    name: "Enterprise",
    price: "Özel",
    note: "Özel veri, entegrasyon ve kontrol ihtiyacı olan büyük gruplar için.",
    features: ["Sınırsız şube", "Özel kullanıcı yapısı", "Gelişmiş entegrasyonlar", "Gelişmiş cost motoru", "Detaylı stok & fire analizi", "Özel KPI raporları", "Kurulum desteği", "Müşteri başarı desteği"],
  },
];

const faq = [
  ["İşletmem için hangi plan uygun?", "Tek şube için Starter, birden fazla şube için Growth daha uygundur. Enterprise büyük gruplar ve özel entegrasyon ihtiyacı için planlanır."],
  ["Kurulum ne kadar sürer?", "Süre POS, stok ve reçete verinizin yapısına göre değişir. COSTERA önce uyumluluk kontrolü yapar, sonra veriyi doğrulayarak canlıya geçer."],
  ["Uzun dönem taahhüt var mı?", "Ticari koşullar plan ve kurulum kapsamına göre şekillendirilebilir. Nihai şartlar onboarding öncesi netleştirilir."],
  ["Entegrasyon zorluğu fiyatı etkiler mi?", "Evet. Hazır connector'lar daha hızlı kurulur. Özel POS, ERP veya local bridge çalışmaları ayrıca fiyatlandırılabilir."],
];

export default function TurkishPricingPage() {
  return (
    <>
      <SiteHeader locale="tr" path="/pricing" />
      <main>
        <section className="pricing-visual-hero">
          <div className="pricing-hero-photo" />
          <div className="shell pricing-visual-grid">
            <div>
              <div className="eyebrow">DAHA KÂRLI RESTORANLAR İÇİN PLANLAR</div>
              <h1>Operasyonunuza uygun planı seçin.</h1>
              <p>
                Bugün ihtiyacınız olan kontrol seviyesiyle başlayın ve restoran grubunuz büyüdükçe genişleyin.
                Nihai fiyat entegrasyon ihtiyacına göre değişebilir.
              </p>
              <div className="trust-row"><span>Gereksiz karmaşa yok</span><span>Yapılandırılmış kurulum</span><span>Net uygulama kapsamı</span></div>
            </div>
            <div className="pricing-hero-quote">
              <strong>Doğru veri.</strong>
              <strong>Daha iyi karar.</strong>
              <strong>Daha güçlü marj.</strong>
            </div>
          </div>
        </section>

        <section className="pricing-plans-section">
          <div className="shell pricing-grid reference-pricing-grid">
            {plans.map((plan) => (
              <article className={`pricing-card ${plan.popular ? "popular" : ""}`} key={plan.name}>
                {plan.popular && <div className="popular-label">EN ÇOK TERCİH EDİLEN</div>}
                <h2>{plan.name}</h2>
                <p>{plan.note}</p>
                <div className="price">{plan.price}{plan.price.startsWith("$") && <span>/ ay</span>}</div>
                <Link className={`button ${plan.popular ? "button-gold" : "button-outline"} full-button`} href="/tr/demo">
                  {plan.name === "Enterprise" ? "İletişime Geç" : "Demo İste"} <span>→</span>
                </Link>
                <ul className="plan-list">{plan.features.map((item) => <li key={item}>✓ {item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section pricing-faq-section">
          <div className="shell pricing-faq-grid">
            <div>
              <div className="eyebrow">SIKÇA SORULAN SORULAR</div>
              <h2>Başlamadan önce net cevaplar.</h2>
              <p>Fiyatlandırma kurulumun yalnızca bir parçasıdır. Canlıya geçmeden önce entegrasyon ve veri kalitesi de kontrol edilir.</p>
              <Link className="button button-outline" href="/tr/demo">Bizimle Görüşün <span>→</span></Link>
            </div>
            <div className="faq-list">
              {faq.map(([q,a]) => (
                <details key={q}>
                  <summary>{q}<span>+</span></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
            <aside className="pricing-help-card">
              <span className="pricing-help-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></span>
              <h3>Hâlâ emin değil misiniz?</h3>
              <p>Plan seçmeden önce mevcut POS, stok ve şube yapınızı birlikte değerlendirebiliriz.</p>
              <Link className="button button-outline full-button" href="/tr/demo">Ücretsiz Değerlendirme İste <span>→</span></Link>
            </aside>
          </div>
        </section>

        <section className="pricing-bottom-banner">
          <div className="shell">
            <div>
              <div className="eyebrow eyebrow-light">DOĞRU KURULUMLA BAŞLAYIN</div>
              <h2>Daha az maliyet kaçağı. Daha fazla kontrol.</h2>
              <p>Yaygınlaştırmadan önce COSTERA&apos;nın işletmenize nasıl uyduğunu görün.</p>
            </div>
            <div className="hero-actions">
              <Link className="button button-gold" href="/tr/demo">Demo İste</Link>
              <Link className="button button-ghost" href="/tr/how-it-works">Nasıl Çalışır?</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
