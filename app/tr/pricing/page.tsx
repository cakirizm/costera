import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const plans = [
  {
    name: "Starter",
    price: "$99",
    note: "Yapılandırılmış maliyet kontrolüne başlayan tek şubeli restoranlar için.",
    features: ["1 şube", "5 kullanıcıya kadar", "POS entegrasyonu", "Reçete maliyet motoru", "Stok fark analizi", "Aylık raporlar", "Mobil uyumlu web erişimi"],
  },
  {
    name: "Growth",
    price: "$249",
    note: "Şube bazlı görünürlüğe ihtiyaç duyan büyüyen restoran grupları için.",
    popular: true,
    features: ["3 şubeye kadar", "25 kullanıcıya kadar", "Tüm şubeler için POS entegrasyonu", "Reçete & cost motoru", "Stok fark analizi", "Delivery analitiği", "Trend raporları", "Öncelikli destek"],
  },
  {
    name: "Enterprise",
    price: "Özel",
    note: "Özel veri, entegrasyon ve kontrol ihtiyacı olan büyük gruplar için.",
    features: ["Sınırsız şube", "Özel kullanıcı yapısı", "Gelişmiş entegrasyonlar", "Özel raporlama", "Kurulum desteği", "Entegrasyon izleme", "Öncelikli uygulama desteği"],
  },
];

export default function TurkishPricingPage() {
  return (
    <>
      <SiteHeader locale="tr" path="/pricing" />
      <main>
        <section className="pricing-hero">
          <div className="shell narrow">
            <div className="eyebrow">FİYATLANDIRMA</div>
            <h1>Operasyonunuzun ihtiyaç duyduğu kontrol seviyesini seçin.</h1>
            <p>
              Odaklı bir kurulumla başlayın ve restoran grubunuz büyüdükçe genişleyin.
              Nihai fiyat entegrasyon ihtiyacına göre değişebilir.
            </p>
          </div>
        </section>

        <section className="section pricing-section">
          <div className="shell pricing-grid">
            {plans.map((plan) => (
              <article className={`pricing-card ${plan.popular ? "popular" : ""}`} key={plan.name}>
                {plan.popular && <div className="popular-label">EN ÇOK TERCİH EDİLEN</div>}
                <h2>{plan.name}</h2>
                <p>{plan.note}</p>
                <div className="price">{plan.price}{plan.price.startsWith("$") && <span>/ ay</span>}</div>
                <Link className={`button ${plan.popular ? "button-gold" : "button-outline"} full-button`} href="/tr/demo">
                  {plan.name === "Enterprise" ? "İletişime Geç" : "Demo İste"}
                </Link>
                <ul className="plan-list">{plan.features.map((item) => <li key={item}>✓ {item}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="shell pricing-note">
            <strong>Farklı bir ihtiyacınız mı var?</strong>
            <span>Özel connector, kurulum ve dedicated deployment seçenekleri ayrıca planlanabilir.</span>
          </div>
        </section>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
