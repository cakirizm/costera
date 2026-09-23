import { tx, localePath, arabicCopy, type AppLocale } from "@/lib/costera/locale";
import Link from "next/link";
import { DashboardMock } from "./DashboardMock";
import { SiteHeader } from "./SiteHeader";

type Locale = AppLocale;

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
      ["inventory", "Smart Inventory Control", "Track stock movement in real time and identify unexplained differences."],
      ["usage", "Theoretical vs. Actual Usage", "Compare recipe-driven expected consumption with actual usage."],
      ["delivery", "Delivery Channel Visibility", "See revenue, cost and profitability across every delivery channel."],
      ["access", "Access Anywhere", "Keep the operation visible from desktop, tablet or mobile."],
    ],
    stats: [
      ["5", "data sources unified", "POS, recipes, inventory, purchasing & delivery"],
      ["1", "live control layer", "Every source normalized into one model"],
      ["0", "vendor lock-in", "Works with any POS or delivery platform"],
      ["min", "to first insight", "Import a file or start the demo instantly"],
    ],
    howEyebrow: "HOW IT WORKS",
    howTitle: "From scattered data to one control view.",
    steps: [
      ["01", "Connect any source", "POS, delivery, accounting or a simple file — COSTERA adapts to what you already use."],
      ["02", "COSTERA normalizes", "Different formats become one operating model: sales, recipes, stock and cost."],
      ["03", "See live control", "Food cost, unexplained variance and channel profit — ready for action."],
    ],
    featEyebrow: "WHAT YOU GET",
    featTitle: "Control where margin is actually lost.",
    features: [
      ["Theoretical vs. actual cost", "See the gap between what recipes should cost and what stock actually used — down to the ingredient."],
      ["Unexplained variance detection", "Separate approved waste from real leakage and get a ranked list of what to review first."],
      ["Channel-level profitability", "Know true profit per delivery channel after commissions, fees and settlements."],
    ],
    ctaEyebrow: "READY WHEN YOU ARE",
    ctaTitle: "Start controlling cost today.",
    ctaBody: "Connect your data or explore the live demo — no long setup, no vendor lock-in.",
    ctaPrimary: "Request Demo",
    ctaSecondary: "Create workspace",
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
      ["inventory", "Akıllı Stok Yönetimi", "Stok hareketlerini anlık izleyin, açıklanamayan farkları tespit edin."],
      ["usage", "Teorik vs. Gerçek Kullanım", "Reçetelere göre beklenen kullanımı gerçek tüketimle karşılaştırın."],
      ["delivery", "Delivery Kanal Görünürlüğü", "Tüm delivery kanallarının maliyet ve kârlılık performansını tek ekranda görün."],
      ["access", "Her Yerden Erişim", "Mobil uyumlu panel ile işletmenizi dilediğiniz yerden takip edin."],
    ],
    stats: [
      ["5", "veri kaynağı tek modelde", "POS, reçete, stok, satın alma & delivery"],
      ["1", "canlı kontrol katmanı", "Tüm kaynaklar tek modele normalize edilir"],
      ["0", "firmaya bağımlılık", "Herhangi bir POS veya delivery platformuyla çalışır"],
      ["dk", "içinde ilk içgörü", "Bir dosya yükleyin veya demoyu anında başlatın"],
    ],
    howEyebrow: "NASIL ÇALIŞIR",
    howTitle: "Dağınık veriden tek kontrol ekranına.",
    steps: [
      ["01", "Herhangi bir kaynağı bağlayın", "POS, delivery, muhasebe veya basit bir dosya — COSTERA zaten kullandığınıza uyum sağlar."],
      ["02", "COSTERA normalize eder", "Farklı formatlar tek operasyon modeline dönüşür: satış, reçete, stok ve maliyet."],
      ["03", "Canlı kontrolü görün", "Food cost, açıklanamayan fark ve kanal kârı — aksiyona hazır."],
    ],
    featEyebrow: "NE ELDE EDERSİNİZ",
    featTitle: "Marjın gerçekten kaybolduğu yeri kontrol edin.",
    features: [
      ["Teorik vs. gerçek maliyet", "Reçetelerin maliyeti ile stokun gerçekte kullandığı arasındaki farkı malzeme bazında görün."],
      ["Açıklanamayan fark tespiti", "Onaylı fireyi gerçek kaçaktan ayırın; önce neyin inceleneceğini sıralı liste olarak alın."],
      ["Kanal bazında kârlılık", "Komisyon, ücret ve settlement sonrası her delivery kanalının gerçek kârını bilin."],
    ],
    ctaEyebrow: "HAZIR OLDUĞUNUZDA",
    ctaTitle: "Maliyeti kontrol etmeye bugün başlayın.",
    ctaBody: "Verinizi bağlayın veya canlı demoyu keşfedin — uzun kurulum yok, firmaya bağımlılık yok.",
    ctaPrimary: "Demo İste",
    ctaSecondary: "Çalışma alanı oluştur",
  },
};

function PillarIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "inventory") return <svg {...common}><path d="M4 7l8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/></svg>;
  if (name === "usage") return <svg {...common}><path d="M4 17l4-5 4 3 6-8"/><path d="M17 7h3v3"/><circle cx="6" cy="18" r="1.4"/></svg>;
  if (name === "delivery") return <svg {...common}><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.7 10.7 15.3 7.3M8.7 13.3l6.6 3.4"/></svg>;
  return <svg {...common}><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>;
}

function FeatureIcon({ index }: { index: number }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (index === 0) return <svg {...common}><path d="M4 19V5M4 19h16"/><path d="M8 15l3-4 3 2 5-7"/></svg>;
  if (index === 1) return <svg {...common}><path d="M12 4 21 20H3L12 4Z"/><path d="M12 10v5M12 18h.01"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18M12 12l5-2.5"/></svg>;
}

export function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "ar" ? arabicCopy(copy.en) : copy[locale];
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <>
      <SiteHeader locale={locale} path="/" />
      <main className="reference-home">
        <section className="reference-hero">
          <div className="reference-hero-bg" />
          <div className="shell reference-hero-grid">
            <div className="reference-hero-copy">
              <div className="eyebrow">{t.eyebrow}</div>

              {locale === "ar" ? (<h1><span>اربط مطبخك بالبيانات،</span><span>وتحكم في <em>ربحية</em></span><span>مطعمك.</span></h1>) : locale === "tr" ? (
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
                  <span className="reference-pillar-icon"><PillarIcon name={icon} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>

        </section>

        <section className="reference-stats">
          <div className="shell reference-stats-grid">
            {t.stats.map(([value, label, sub]) => (
              <article key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{sub}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="reference-how">
          <div className="shell">
            <div className="reference-how-head">
              <div className="eyebrow">{t.howEyebrow}</div>
              <h2>{t.howTitle}</h2>
            </div>
            <div className="reference-steps">
              {t.steps.map(([num, title, text], i) => (
                <article className="reference-step" key={num}>
                  <span className="reference-step-num">{num}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  {i < t.steps.length - 1 && <i className="reference-step-arrow">→</i>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="reference-features">
          <div className="shell">
            <div className="reference-how-head">
              <div className="eyebrow">{t.featEyebrow}</div>
              <h2>{t.featTitle}</h2>
            </div>
            <div className="reference-feature-grid">
              {t.features.map(([title, text], i) => (
                <article className="reference-feature" key={title}>
                  <span className="reference-feature-icon"><FeatureIcon index={i} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="reference-cta">
          <div className="shell reference-cta-inner">
            <div className="eyebrow eyebrow-light">{t.ctaEyebrow}</div>
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaBody}</p>
            <div className="reference-cta-actions">
              <Link className="button button-gold" href={`${prefix}/demo`}>{t.ctaPrimary}<span>→</span></Link>
              <Link className="button button-outline reference-cta-outline" href={localePath(locale, "/register")}>{t.ctaSecondary}</Link>
            </div>
          </div>
          <div className="reference-signature">{tx(locale, "CONTROL COSTS. GROW PROFIT.", "MALİYETİ KONTROL ET. KÂRI ARTIR.")}</div>
        </section>
      </main>
    </>
  );
}
