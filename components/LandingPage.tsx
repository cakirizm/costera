import Link from "next/link";
import { DashboardMock } from "./DashboardMock";
import { SiteHeader } from "./SiteHeader";

type Locale = "en" | "tr";

const copy = {
  en: {
    eyebrow: "SMART COST CONTROL FOR RESTAURANTS",
    body:
      "COSTERA brings POS, recipes, inventory, purchasing and delivery channels into one platform. It identifies unexplained stock variance and helps you keep food cost under control.",
    demo: "Request Demo",
    how: "How It Works",
    trust: ["Fast setup", "Works with your existing systems", "Built for restaurants"],
    note: "Built for more profitable restaurants.",
    why: "WHY COSTERA?",
    whyTitleA: "Less leakage,",
    whyTitleB: "more profit.",
    whyBody: "See your restaurant operation from end to end and keep control where it matters.",
    pillars: [
      ["◫", "Smart Inventory Control", "Track stock movement in real time and identify unexplained differences."],
      ["≋", "Theoretical vs. Actual Usage", "Compare recipe-driven expected consumption with actual usage."],
      ["▥", "Delivery Channel Visibility", "See revenue, cost and profitability across every delivery channel."],
      ["▣", "Access Anywhere", "Keep the operation visible from desktop, tablet or mobile."],
    ],
  },
  tr: {
    eyebrow: "RESTORANLAR İÇİN AKILLI MALİYET KONTROLÜ",
    body:
      "COSTERA; POS, reçeteler, stok, satın alma ve delivery kanallarını tek platformda birleştirir. Açıklanamayan stok farklarını tespit eder ve food cost'unuzu kontrol altında tutmanıza yardımcı olur.",
    demo: "Demo İste",
    how: "Nasıl Çalışır?",
    trust: ["Hızlı kurulum", "Mevcut sistemlerinizle entegre", "Restoranlar için tasarlandı"],
    note: "Daha kârlı restoranlar için.",
    why: "NEDEN COSTERA?",
    whyTitleA: "Daha az kayıp,",
    whyTitleB: "daha fazla kâr.",
    whyBody: "Restoran operasyonlarınızı uçtan uca görün, kontrolü elinizde tutun.",
    pillars: [
      ["◫", "Akıllı Stok Yönetimi", "Stok hareketlerini anlık izleyin, açıklanamayan farkları tespit edin."],
      ["≋", "Teorik vs. Gerçek Kullanım", "Reçetelere göre beklenen kullanımı gerçek tüketimle karşılaştırın."],
      ["▥", "Delivery Kanal Görünürlüğü", "Tüm delivery kanallarının maliyet ve kârlılık performansını tek ekranda görün."],
      ["▣", "Her Yerden Erişim", "Mobil uyumlu panel ile işletmenizi dilediğiniz yerden takip edin."],
    ],
  },
};

export function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  const prefix = locale === "tr" ? "/tr" : "";

  return (
    <>
      <SiteHeader locale={locale} path="/" />
      <main className="reference-home">
        <section className="reference-hero">
          <div className="reference-hero-bg" />
          <div className="shell reference-hero-grid">
            <div className="reference-hero-copy">
              <div className="eyebrow">{t.eyebrow}</div>

              {locale === "tr" ? (
                <h1>
                  <span>Mutfağınızı veriye</span>
                  <span>bağlayın, <em>kârlılığınızı</em></span>
                  <span>kontrol altına alın.</span>
                </h1>
              ) : (
                <h1>
                  <span>Connect your kitchen</span>
                  <span>to data, keep <em>profitability</em></span>
                  <span>under control.</span>
                </h1>
              )}

              <p>{t.body}</p>

              <div className="reference-hero-actions">
                <Link className="button button-gold" href={`${prefix}/demo`}>
                  {t.demo}<span>→</span>
                </Link>
                <Link className="button button-outline reference-outline" href={`${prefix}/how-it-works`}>
                  <span className="reference-play">▶</span>{t.how}
                </Link>
              </div>

              <div className="reference-trust">
                {t.trust.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>

            <div className="reference-product">
              <DashboardMock locale={locale} />
              <div className="reference-hand-note">{t.note}</div>
            </div>
          </div>
        </section>

        <section className="reference-why">
          <div className="shell reference-why-grid">
            <div className="reference-why-intro">
              <div className="eyebrow">{t.why}</div>
              <h2>{t.whyTitleA}<br />{t.whyTitleB}</h2>
              <p>{t.whyBody}</p>
            </div>

            <div className="reference-pillar-grid">
              {t.pillars.map(([icon,title,text]) => (
                <article className="reference-pillar" key={title}>
                  <span className="reference-pillar-icon">{icon}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="reference-signature">CONTROL COSTS. GROW PROFIT.</div>
        </section>
      </main>
    </>
  );
}
