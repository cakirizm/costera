import Link from "next/link";
import { DashboardMock } from "./DashboardMock";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type Locale = "en" | "tr";

const content = {
  en: {
    heroEyebrow: "SMART COST CONTROL FOR RESTAURANTS",
    heroTitle: "Connect your kitchen to data.",
    heroTitleAccent: "Keep profitability under control.",
    heroText:
      "COSTERA brings POS, recipes, inventory, purchasing and delivery channels into one operating view. It helps you identify unexplained stock variance and keep food cost under control.",
    demo: "Request Demo",
    how: "How It Works",
    trust: ["Fast setup", "Works with your existing systems", "Designed for restaurant operations"],
    script: "Built for better restaurant decisions.",
    why: "WHY COSTERA?",
    whyTitle: "Less leakage.\nMore margin.",
    whyText: "See restaurant operations from end to end and keep control where it matters most.",
    pillars: [
      ["◫", "Smart Inventory Control", "Follow stock movement, purchases and counts while highlighting unexplained differences."],
      ["≋", "Theoretical vs. Actual Usage", "Compare recipe-driven expected consumption with real usage by ingredient and period."],
      ["▥", "Delivery Channel Visibility", "See revenue, cost and profitability across direct sales and delivery channels in one place."],
      ["▣", "Access Anywhere", "Review the same clear management view from desktop, tablet or mobile."],
    ],
    signature: "CONTROL COSTS. GROW PROFIT.",
    howEyebrow: "SIMPLE INTEGRATION. STRONGER CONTROL.",
    howTitle: "How COSTERA turns restaurant data into action.",
    howText:
      "Existing systems keep running as usual. COSTERA reads, validates and interprets the data, then brings the important exceptions to the surface.",
    steps: [
      ["1", "POS and delivery data flows in", "Sales and order data are collected automatically from connected sources.", "channels"],
      ["2", "Menu items are linked to recipes", "Each sold item is connected to the ingredients and quantities it should consume.", "recipe"],
      ["3", "Stock movement is understood", "Purchases, transfers, waste and counts are brought into the same operating model.", "stock"],
      ["4", "Expected and actual usage are compared", "COSTERA calculates what should have been used and compares it with real consumption.", "compare"],
      ["5", "Unexplained variance is isolated", "Known adjustments are separated from quantity and value that still need review.", "variance"],
      ["6", "Management sees what needs attention", "A simple mobile-ready view shows where cost, stock or recipe performance is drifting.", "mobile"],
    ],
    more: "MORE THAN REPORTING",
    moreTitle: "Practical control\nfor daily operations.",
    benefits: [
      ["Time Saved", "Less manual consolidation and spreadsheet work."],
      ["Lower Cost Leakage", "Spot unusual consumption before it becomes normal."],
      ["Clearer Operations", "One consistent view across stock, recipes and sales."],
      ["Faster Decisions", "See the issue, the value and the period in one place."],
      ["Stronger Margins", "Protect profitability with better cost visibility."],
    ],
    productEyebrow: "EVERYTHING IN ONE OPERATING VIEW",
    productTitle: "Control the processes that shape your food cost.",
    productText:
      "COSTERA connects stock, recipes, purchasing, sales and delivery data so cost movement becomes visible instead of being discovered after month-end.",
    modules: {
      inventory: ["Inventory Control", "See stock on hand, unit cost and quantity differences."],
      recipe: ["Recipe & Food Cost", "Track recipe cost and target food-cost performance."],
      purchase: ["Purchasing", "Understand supplier cost movement and purchase impact."],
      delivery: ["Delivery Channel Analysis", "Compare direct and delivery channel economics side by side."],
      variance: ["Theoretical vs. Actual Consumption", "Compare recipe-driven usage with the stock that actually moved."],
      mobile: ["Mobile Management View", "Review the key numbers from anywhere without opening technical setup screens."],
      alerts: ["Alerts & Exception Monitoring", "Bring unusual consumption, target breaches and integration issues to the surface."],
    },
    finalEyebrow: "START WITH BETTER VISIBILITY",
    finalTitle: "More control in the kitchen.",
    finalAccent: "More margin in the business.",
    finalText:
      "Make cost movement visible, review the exceptions and keep your restaurant operation easier to control.",
  },
  tr: {
    heroEyebrow: "RESTORANLAR İÇİN AKILLI MALİYET KONTROLÜ",
    heroTitle: "Mutfağınızı veriye bağlayın.",
    heroTitleAccent: "Kârlılığınızı kontrol altında tutun.",
    heroText:
      "COSTERA; POS, reçeteler, stok, satın alma ve delivery kanallarını tek bir operasyon görünümünde birleştirir. Açıklanamayan stok farklarını görmenize ve food cost'u kontrol altında tutmanıza yardımcı olur.",
    demo: "Demo İste",
    how: "Nasıl Çalışır?",
    trust: ["Hızlı kurulum", "Mevcut sistemlerinizle entegre", "Restoran operasyonları için tasarlandı"],
    script: "Daha kârlı restoranlar için.",
    why: "NEDEN COSTERA?",
    whyTitle: "Daha az kayıp.\nDaha fazla kâr.",
    whyText: "Restoran operasyonlarınızı uçtan uca görün ve kritik maliyet noktalarında kontrolü elinizde tutun.",
    pillars: [
      ["◫", "Akıllı Stok Kontrolü", "Stok hareketlerini, satın almaları ve sayımları izleyin; açıklanamayan farkları görün."],
      ["≋", "Teorik vs. Gerçek Tüketim", "Reçeteye göre beklenen tüketimi gerçek kullanımla malzeme ve dönem bazında karşılaştırın."],
      ["▥", "Delivery Kanal Görünürlüğü", "Restoran içi ve delivery satışların gelir, maliyet ve kârlılığını tek yerde görün."],
      ["▣", "Her Yerden Erişim", "Aynı sade yönetim görünümüne bilgisayar, tablet veya telefondan erişin."],
    ],
    signature: "MALİYETİ KONTROL ET. KÂRI BÜYÜT.",
    howEyebrow: "BASİT ENTEGRASYON. GÜÇLÜ KONTROL.",
    howTitle: "COSTERA restoran verisini nasıl aksiyona dönüştürür?",
    howText:
      "Mevcut sistemleriniz çalışmaya devam eder. COSTERA veriyi okur, doğrular ve anlamlandırır; önemli istisnaları önünüze getirir.",
    steps: [
      ["1", "POS ve delivery verileri toplanır", "Satış ve sipariş verileri bağlı kaynaklardan otomatik olarak alınır.", "channels"],
      ["2", "Menü ürünleri reçetelerle eşleşir", "Satılan her ürün, tüketmesi gereken malzeme ve miktarlarla ilişkilendirilir.", "recipe"],
      ["3", "Stok hareketleri anlamlandırılır", "Satın alma, transfer, fire ve sayımlar aynı operasyon modeline taşınır.", "stock"],
      ["4", "Teorik ve gerçek tüketim karşılaştırılır", "Ne kadar tüketilmesi gerektiği hesaplanır ve gerçek tüketimle yan yana getirilir.", "compare"],
      ["5", "Açıklanamayan fark ayrıştırılır", "Bilinen fire ve onaylı kullanım düşülür; incelenmesi gereken fark ayrı gösterilir.", "variance"],
      ["6", "Yönetim neye bakacağını net görür", "Mobil uyumlu sade ekran; cost, stok ve reçete performansındaki sapmaları öne çıkarır.", "mobile"],
    ],
    more: "SADECE RAPOR DEĞİL",
    moreTitle: "Günlük operasyon için\ngerçek kontrol.",
    benefits: [
      ["Zaman Kazandırır", "Manuel veri toplama ve Excel yükünü azaltır."],
      ["Kaçağı Azaltır", "Olağandışı tüketimi normalleşmeden önce fark edin."],
      ["Şeffaflık Sağlar", "Stok, reçete ve satışları tek tutarlı görünümde izleyin."],
      ["Daha Hızlı Karar", "Sorunu, parasal etkisini ve dönemi tek yerde görün."],
      ["Kârlılığı Korur", "Food cost hareketini daha erken görerek marjı koruyun."],
    ],
    productEyebrow: "TÜM OPERASYONUNUZ TEK GÖRÜNÜMDE",
    productTitle: "Food cost'unuzu şekillendiren süreçleri kontrol edin.",
    productText:
      "COSTERA stok, reçete, satın alma, satış ve delivery verilerini birleştirir; maliyet hareketlerini ay sonunu beklemeden görünür hale getirir.",
    modules: {
      inventory: ["Stok Kontrolü", "Mevcut stoku, birim maliyeti ve miktar farklarını görün."],
      recipe: ["Reçete & Food Cost", "Reçete maliyetini ve hedef food cost performansını takip edin."],
      purchase: ["Satın Alma", "Tedarikçi fiyat değişimlerini ve menü maliyetine etkisini anlayın."],
      delivery: ["Delivery Kanal Analizi", "Doğrudan ve delivery kanallarının ekonomisini yan yana karşılaştırın."],
      variance: ["Teorik vs. Gerçek Tüketim", "Reçeteye göre beklenen kullanım ile gerçekten hareket eden stoğu karşılaştırın."],
      mobile: ["Mobil Yönetim Ekranı", "Teknik kurulum ekranlarına girmeden kritik rakamları her yerden görün."],
      alerts: ["Uyarılar & İstisna Takibi", "Olağandışı tüketim, hedef aşımı ve entegrasyon sorunlarını öne çıkarın."],
    },
    finalEyebrow: "DAHA İYİ GÖRÜNÜRLÜKLE BAŞLAYIN",
    finalTitle: "Mutfakta daha fazla kontrol.",
    finalAccent: "İşletmede daha güçlü kâr.",
    finalText:
      "Maliyet hareketlerini görünür hale getirin, istisnaları inceleyin ve restoran operasyonunu daha kolay kontrol edin.",
  },
};

function StepVisual({ type, locale }: { type: string; locale: Locale }) {
  const tr = locale === "tr";
  if (type === "channels") {
    return <div className="step-visual channel-visual"><span>POS</span><span>DELIVERY</span><span>API</span></div>;
  }
  if (type === "recipe") {
    return (
      <div className="step-visual recipe-visual">
        <div className="food-circle">◎</div>
        <ul>
          <li>{tr ? "Tavuk 120 g" : "Chicken 120 g"}</li>
          <li>{tr ? "Marul 80 g" : "Lettuce 80 g"}</li>
          <li>{tr ? "Sos 30 g" : "Sauce 30 g"}</li>
        </ul>
      </div>
    );
  }
  if (type === "stock") {
    return (
      <div className="step-visual stock-visual">
        <span>{tr ? "Stok Girişi" : "Stock In"}</span>
        <span>{tr ? "Satın Alma" : "Purchase"}</span>
        <span>{tr ? "Fire / Zayi" : "Waste"}</span>
      </div>
    );
  }
  if (type === "compare") {
    return (
      <div className="step-visual compare-visual">
        <div><small>{tr ? "Teorik" : "Expected"}</small><strong>$8,420</strong></div>
        <div><small>{tr ? "Gerçek" : "Actual"}</small><strong>$9,680</strong></div>
      </div>
    );
  }
  if (type === "variance") {
    return (
      <div className="step-visual variance-visual">
        <small>{tr ? "Açıklanamayan Fark" : "Unexplained Variance"}</small>
        <strong>$1,260</strong>
        <span>{tr ? "Tavuk +18%" : "Chicken +18%"}</span>
        <span>{tr ? "Zeytinyağı +22%" : "Olive Oil +22%"}</span>
      </div>
    );
  }
  return (
    <div className="step-visual mobile-visual">
      <div className="phone-mini">
        <small>{tr ? "Bugün" : "Today"}</small>
        <strong>$8,320</strong>
        <span>Food Cost 28.9%</span>
      </div>
    </div>
  );
}

export function LandingPage({ locale = "en" }: { locale?: Locale }) {
  const t = content[locale];
  const prefix = locale === "tr" ? "/tr" : "";

  return (
    <>
      <SiteHeader locale={locale} path="/" />
      <main>
        <section className="hero hero-reference">
          <div className="hero-photo-layer" />
          <div className="shell hero-reference-grid">
            <div className="hero-copy hero-reference-copy">
              <div className="eyebrow">{t.heroEyebrow}</div>
              <h1>{t.heroTitle}<span>{t.heroTitleAccent}</span></h1>
              <p>{t.heroText}</p>
              <div className="hero-actions">
                <Link className="button button-gold" href={`${prefix}/demo`}>{t.demo} <span>→</span></Link>
                <Link className="button button-outline play-button" href={`${prefix}/how-it-works`}>
                  <span className="play-icon">▶</span> {t.how}
                </Link>
              </div>
              <div className="trust-row">{t.trust.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
            <div className="hero-product-stage">
              <DashboardMock locale={locale} />
              <span className="hero-script-note">{t.script}</span>
            </div>
          </div>
        </section>

        <section className="section why-section">
          <div className="shell why-layout">
            <div className="why-intro">
              <div className="eyebrow">{t.why}</div>
              <h2>{t.whyTitle.split("\n").map((line, i) => <span key={line}>{line}{i === 0 && <br/>}</span>)}</h2>
              <p>{t.whyText}</p>
            </div>
            <div className="why-cards">
              {t.pillars.map(([icon, title, text]) => (
                <article className="why-card" key={title}>
                  <span className="why-icon">{icon}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="section-signature">{t.signature}</div>
        </section>

        <section className="section soft-section how-preview-section">
          <div className="shell section-heading split-title">
            <div>
              <div className="eyebrow">{t.howEyebrow}</div>
              <h2>{t.howTitle}</h2>
            </div>
            <p>{t.howText}</p>
          </div>

          <div className="shell six-step-grid">
            {t.steps.map(([no, title, text, visual]) => (
              <article className="step-card" key={no}>
                <span className="step-badge">{no}</span>
                <StepVisual type={visual} locale={locale} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>

          <div className="shell benefits-strip">
            <div className="benefit-lead">
              <span>{t.more}</span>
              <strong>{t.moreTitle.split("\n").map((line, i) => <span key={line}>{line}{i === 0 && <br/>}</span>)}</strong>
            </div>
            {t.benefits.map(([title, text]) => (
              <div className="benefit-item" key={title}>
                <span className="benefit-icon">✓</span>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="section product-detail-section">
          <div className="shell product-detail-heading">
            <div>
              <div className="eyebrow">{t.productEyebrow}</div>
              <h2>{t.productTitle}</h2>
            </div>
            <p>{t.productText}</p>
          </div>

          <div className="shell product-module-grid">
            <article className="module-showcase">
              <span className="module-icon">◫</span>
              <h3>{t.modules.inventory[0]}</h3>
              <p>{t.modules.inventory[1]}</p>
              <div className="mini-table">
                <div><span>Beef Tenderloin</span><b>12.5 kg</b><em>$18.40</em></div>
                <div><span>Mozzarella</span><b>8.0 kg</b><em>$6.20</em></div>
                <div><span>Tomatoes</span><b>4.0 kg</b><em>$2.10</em></div>
              </div>
            </article>

            <article className="module-showcase">
              <span className="module-icon">≋</span>
              <h3>{t.modules.recipe[0]}</h3>
              <p>{t.modules.recipe[1]}</p>
              <div className="recipe-panel">
                <div className="dish-photo">◎</div>
                <div>
                  <strong>Truffle Pasta</strong>
                  <span>{locale === "tr" ? "Reçete maliyeti $4.21" : "Recipe cost $4.21"}</span>
                  <span>{locale === "tr" ? "Hedef 28.0%" : "Target 28.0%"}</span>
                  <b>{locale === "tr" ? "Gerçek 34.5%" : "Actual 34.5%"}</b>
                </div>
              </div>
            </article>

            <article className="module-showcase">
              <span className="module-icon">▥</span>
              <h3>{t.modules.purchase[0]}</h3>
              <p>{t.modules.purchase[1]}</p>
              <div className="purchase-list">
                <span>Metro <b>$1,240</b></span>
                <span>Bidfood <b>$980</b></span>
                <span>Fresh Supply <b>$640</b></span>
              </div>
            </article>

            <article className="module-showcase">
              <span className="module-icon">▦</span>
              <h3>{t.modules.delivery[0]}</h3>
              <p>{t.modules.delivery[1]}</p>
              <div className="channel-table">
                <span>{locale === "tr" ? "Restoran içi" : "Dine-in"} <b>22.4%</b></span>
                <span>Delivery <b>12.1%</b></span>
                <span>Takeaway <b>18.7%</b></span>
              </div>
            </article>

            <article className="module-showcase wide-module">
              <span className="module-icon">◎</span>
              <h3>{t.modules.variance[0]}</h3>
              <p>{t.modules.variance[1]}</p>
              <div className="variance-table">
                <div><span>{locale === "tr" ? "Tavuk Göğsü" : "Chicken Breast"}</span><b>50.0 kg</b><b>62.8 kg</b><em>+25.6%</em></div>
                <div><span>{locale === "tr" ? "Zeytinyağı" : "Olive Oil"}</span><b>18.0 L</b><b>21.4 L</b><em>+18.9%</em></div>
                <div><span>Mozzarella</span><b>20.0 kg</b><b>18.2 kg</b><i>-9.0%</i></div>
              </div>
            </article>

            <article className="module-showcase mobile-module">
              <span className="module-icon">▣</span>
              <h3>{t.modules.mobile[0]}</h3>
              <p>{t.modules.mobile[1]}</p>
              <div className="phone-card">
                <span>{locale === "tr" ? "Bugün" : "Today"}</span>
                <strong>$6,240</strong>
                <small>Food Cost 28.9%</small>
              </div>
            </article>

            <article className="module-showcase alert-module">
              <span className="module-icon">△</span>
              <h3>{t.modules.alerts[0]}</h3>
              <p>{t.modules.alerts[1]}</p>
              <div className="alert-list">
                <span>{locale === "tr" ? "Tavuk tüketimi beklenenden %25.6 yüksek." : "Chicken usage 25.6% above expected."}</span>
                <span>{locale === "tr" ? "Truffle Pasta food cost hedefin üzerinde." : "Truffle Pasta food cost is above target."}</span>
                <span>{locale === "tr" ? "Mozzarella stoku minimum seviyeye yaklaşıyor." : "Mozzarella stock is approaching minimum level."}</span>
              </div>
            </article>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-cta-photo" />
          <div className="shell final-cta-inner">
            <div>
              <div className="eyebrow eyebrow-light">{t.finalEyebrow}</div>
              <h2>{t.finalTitle}<br/><span>{t.finalAccent}</span></h2>
            </div>
            <div className="final-cta-copy">
              <p>{t.finalText}</p>
              <div>
                <Link className="button button-gold" href={`${prefix}/demo`}>{t.demo} <span>→</span></Link>
                <Link className="button button-ghost" href={`${prefix}/how-it-works`}>{t.how}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
