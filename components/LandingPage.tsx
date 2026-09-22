import Link from "next/link";
import { DashboardMock } from "./DashboardMock";
import { SiteHeader } from "./SiteHeader";

type Locale = "en" | "tr";
type IconKind = "stock" | "usage" | "delivery" | "mobile";

const copy = {
  en: {
    eyebrow: "SMART COST CONTROL FOR RESTAURANTS",
    body:
      "COSTERA brings POS, recipes, inventory, purchasing and delivery channels into one platform. It identifies unexplained stock variance and helps you keep food cost under control.",
    demo: "Request Demo",
    how: "How It Works",
    trust: ["Fast setup", "Works with your existing systems", "Built for restaurants"],
    note: "For more profitable restaurants.",
    why: "WHY COSTERA?",
    whyTitleA: "Less leakage,",
    whyTitleB: "more profit.",
    whyBody: "See your restaurant operation from end to end and keep control where it matters.",
    pillars: [
      ["stock", "Smart Inventory Control", "Track stock movement in real time and identify unexplained differences."],
      ["usage", "Theoretical vs. Actual Usage", "Compare recipe-driven expected consumption with actual usage."],
      ["delivery", "Delivery Channel Visibility", "See revenue, cost and profitability across every delivery channel."],
      ["mobile", "Access Anywhere", "Keep the operation visible from desktop, tablet or mobile."],
    ] as [IconKind, string, string][],
  },
  tr: {
    eyebrow: "RESTORANLAR İÇİN AKILLI MALİYET KONTROLÜ",
    body:
      "COSTERA; POS, reçeteler, stok, satın alma ve delivery kanallarınızı tek bir platformda birleştirir. Açıklanamayan stok farklarını tespit eder, food cost'unuzu kontrol altına almanıza yardımcı olur.",
    demo: "Demo İste",
    how: "Nasıl Çalışır?",
    trust: ["Hızlı kurulum", "Mevcut sistemlerinizle entegre", "Restoranlar için tasarlandı"],
    note: "Daha kârlı restoranlar için.",
    why: "NEDEN COSTERA?",
    whyTitleA: "Daha az kayıp,",
    whyTitleB: "daha fazla kâr.",
    whyBody: "Restoran operasyonlarınızı uçtan uca görün, kontrolü elinizde tutun.",
    pillars: [
      ["stock", "Akıllı Stok Yönetimi", "Stok hareketlerini anlık izleyin, açıklanamayan farkları tespit edin."],
      ["usage", "Teorik vs. Gerçek Kullanım", "Reçetelere göre beklenen kullanımı gerçek tüketimle karşılaştırın."],
      ["delivery", "Delivery Kanal Görünürlüğü", "Tüm delivery kanallarının maliyet ve kârlılık performansını tek ekranda görün."],
      ["mobile", "Her Yerden Erişim", "Mobil uyumlu panel ile işletmenizi dilediğiniz yerden takip edin."],
    ] as [IconKind, string, string][],
  },
};

function PillarIcon({ kind }: { kind: IconKind }) {
  if (kind === "stock") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="m20 5 12 6.8v16.4L20 35 8 28.2V11.8L20 5Z" />
        <path d="m8.8 12.4 11.2 6.4 11.2-6.4M20 18.8V35" />
      </svg>
    );
  }
  if (kind === "usage") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect x="9" y="5.5" width="22" height="29" rx="2" />
        <path d="M14 12h12M14 17h12M14 22h7M14 27h12" />
        <path d="m24 21 2.2 2.2L31 18.4" />
      </svg>
    );
  }
  if (kind === "delivery") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M6 11h19v16H6zM25 17h5l4 5v5h-9z" />
        <circle cx="12" cy="30" r="3" />
        <circle cx="29" cy="30" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="12" y="4.5" width="16" height="31" rx="3" />
      <path d="M17 8h6M18 31.5h4" />
    </svg>
  );
}

export function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale];
  const prefix = locale === "tr" ? "/tr" : "";

  return (
    <>
      <SiteHeader locale={locale} path="/" />

      <main className={`approved-home approved-home-${locale}`}>
        <section className="approved-hero">
          <div className="approved-hero-image" aria-hidden="true" />

          <div className="approved-shell approved-hero-grid">
            <div className="approved-hero-copy">
              <div className="approved-eyebrow">
                <span />
                {t.eyebrow}
              </div>

              {locale === "tr" ? (
                <h1 className="approved-title approved-title-tr">
                  <span>Mutfağınızı veriye</span>
                  <span>bağlayın, <em>kârlılığınızı</em></span>
                  <span>kontrol altına alın.</span>
                </h1>
              ) : (
                <h1 className="approved-title approved-title-en">
                  <span>Connect your kitchen</span>
                  <span>to data, keep <em>profitability</em></span>
                  <span>under control.</span>
                </h1>
              )}

              <p className="approved-description">{t.body}</p>

              <div className="approved-actions">
                <Link className="approved-primary" href={`${prefix}/demo`}>
                  {t.demo}<span>→</span>
                </Link>
                <Link className="approved-secondary" href={`${prefix}/how-it-works`}>
                  <span className="approved-play">▶</span>
                  {t.how}
                </Link>
              </div>

              <div className="approved-trust">
                {t.trust.map((item) => (
                  <span key={item}><b>✓</b>{item}</span>
                ))}
              </div>
            </div>

            <div className="approved-visual">
              <DashboardMock locale={locale} />
              <div className="approved-note">{t.note}</div>
            </div>
          </div>
        </section>

        <section className="approved-why">
          <div className="approved-shell approved-why-grid">
            <div className="approved-why-intro">
              <div className="approved-eyebrow approved-eyebrow-small">
                <span />
                {t.why}
              </div>
              <h2>{t.whyTitleA}<br />{t.whyTitleB}</h2>
              <p>{t.whyBody}</p>
            </div>

            <div className="approved-pillar-grid">
              {t.pillars.map(([kind, title, text]) => (
                <article className="approved-pillar" key={title}>
                  <span className="approved-pillar-icon">
                    <PillarIcon kind={kind} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="approved-signature">
            <span />
            CONTROL COSTS. GROW PROFIT.
            <span />
          </div>
        </section>
      </main>
    </>
  );
}
