import Image from "next/image";
import { tx } from "@/lib/costera/locale";
import { arabicCopy, type AppLocale } from "@/lib/costera/locale";
type Locale = AppLocale;

const copy = {
  en: {
    steps: [
      ["POS & delivery data is collected", "Sales and order activity flows automatically from connected sources."],
      ["Menu and recipes are matched", "Each sold item is connected to the ingredients and quantities it should consume."],
      ["Stock movement is read", "Purchases, transfers, waste and counts are interpreted in the same operating model."],
      ["Expected vs. actual is compared", "Recipe-driven usage is compared with what inventory actually consumed."],
      ["Unexplained variance is isolated", "Known adjustments are removed so the remaining quantity and value can be reviewed."],
      ["Management sees the result", "A mobile-ready view shows the cost, stock and recipe areas that need attention."],
    ],
    ctas: ["Connect systems", "Link recipes", "Track inventory", "See variances", "Find root cause", "Take action"],
    expected: "Expected",
    actual: "Actual",
    difference: "Difference",
    variance: "Unexplained Variance",
    today: "Today",
    alerts: "Live alerts",
    reports: "Reports",
    mobile: "Mobile access",
    stockIn: "Stock In",
    purchase: "Purchase",
    transfer: "Transfer",
    waste: "Waste",
  },
  tr: {
    steps: [
      ["POS ve delivery verileri toplanır", "Satış ve sipariş hareketleri bağlı kaynaklardan otomatik olarak alınır."],
      ["Menü ve reçeteler eşleşir", "Satılan her ürün, tüketmesi gereken malzeme ve miktarlarla ilişkilendirilir."],
      ["Stok hareketleri okunur", "Satın alma, transfer, fire ve sayımlar aynı operasyon modelinde anlamlandırılır."],
      ["Teorik ve gerçek karşılaştırılır", "Reçeteye göre beklenen kullanım, stoğun gerçek tüketimiyle karşılaştırılır."],
      ["Açıklanamayan fark ayrıştırılır", "Bilinen düzeltmeler düşülür; geriye kalan miktar ve parasal etki incelenir."],
      ["Yönetim sonucu net görür", "Mobil uyumlu ekran cost, stok ve reçete tarafındaki kritik alanları öne çıkarır."],
    ],
    ctas: ["Sistemleri bağla", "Reçeteleri eşleştir", "Stoğu takip et", "Sapmayı gör", "Kök nedeni bul", "Aksiyon al"],
    expected: "Teorik",
    actual: "Gerçek",
    difference: "Fark",
    variance: "Açıklanamayan Fark",
    today: "Bugün",
    alerts: "Canlı uyarılar",
    reports: "Raporlar",
    mobile: "Mobil erişim",
    stockIn: "Stok Girişi",
    purchase: "Satın Alma",
    transfer: "Transfer",
    waste: "Fire / Zayi",
  },
};

function StepNumber({ n }: { n: number }) {
  return <span className="how-pro-number">{n}</span>;
}

function CardFooter({ label }: { label: string }) {
  return (
    <div className="how-pro-cta">
      <span>→</span>
      <b>{label}</b>
    </div>
  );
}

export function HowProcess({ locale = "en" }: { locale?: Locale }) {
  const t = locale === "ar" ? arabicCopy(copy.en) : copy[locale];

  return (
    <div className="how-pro-grid">
      <article className="how-pro-card">
        <StepNumber n={1} />
        <div className="how-pro-visual how-pos-visual how-photo-visual">
          <Image
            src="https://images.unsplash.com/photo-1778792447408-b22ad88daa37?auto=format&fit=crop&w=900&q=85"
            alt="Restaurant POS terminal processing orders"
            className="how-real-photo how-pos-photo"
            width={900}
            height={600}
            unoptimized
          />
          <div className="how-photo-shade" />
          <div className="how-pos-source-list how-pos-source-overlay">
            <span><i>▣</i>POS</span>
            <span><i>◈</i>{tx(locale, "Delivery", "Delivery")}</span>
            <span><i>⌁</i>API</span>
          </div>
          <div className="how-flow-dots"><i /><i /><i /><i /></div>
        </div>
        <h3>{t.steps[0][0]}</h3>
        <p>{t.steps[0][1]}</p>
        <CardFooter label={t.ctas[0]} />
      </article>

      <article className="how-pro-card">
        <StepNumber n={2} />
        <div className="how-pro-visual how-recipe-visual how-photo-visual">
          <Image
            src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=86"
            alt="Chef preparing a recipe with fresh ingredients"
            className="how-real-photo how-food-real-photo"
            width={900}
            height={600}
            unoptimized
          />
          <div className="how-photo-shade how-food-shade" />
          <div className="how-recipe-list how-recipe-overlay">
            <span><i>✓</i>{tx(locale, "Chicken 120 g", "Chicken 120 g")}</span>
            <span><i>✓</i>{tx(locale, "Sauce 30 g", "Sauce 30 g")}</span>
            <span><i>✓</i>{tx(locale, "Parmesan 10 g", "Parmesan 10 g")}</span>
            <span><i>✓</i>{tx(locale, "Basil 5 g", "Basil 5 g")}</span>
          </div>
        </div>
        <h3>{t.steps[1][0]}</h3>
        <p>{t.steps[1][1]}</p>
        <CardFooter label={t.ctas[1]} />
      </article>

      <article className="how-pro-card">
        <StepNumber n={3} />
        <div className="how-pro-visual how-stock-visual">
          <div className="how-stock-heading">{tx(locale, "Stock Movement", "Stock Movement")}</div>
          <div className="how-stock-row"><span><i className="stock-emoji">🍅</i>{t.stockIn}</span><b>{tx(locale, "50 kg", "50 kg")}</b></div>
          <div className="how-stock-row"><span><i className="stock-emoji">🍗</i>{t.purchase}</span><b>{tx(locale, "30 kg", "30 kg")}</b></div>
          <div className="how-stock-row"><span><i className="stock-emoji">🥬</i>{t.transfer}</span><b>{tx(locale, "5 kg", "5 kg")}</b></div>
          <div className="how-stock-row"><span><i className="stock-emoji">🗑️</i>{t.waste}</span><b>{tx(locale, "2 kg", "2 kg")}</b></div>
        </div>
        <h3>{t.steps[2][0]}</h3>
        <p>{t.steps[2][1]}</p>
        <CardFooter label={t.ctas[2]} />
      </article>

      <article className="how-pro-card">
        <StepNumber n={4} />
        <div className="how-pro-visual how-compare-visual">
          <div className="how-compare-box">
            <small>{t.expected}</small>
            <strong>$8,420</strong>
            <span className="how-bars blue"><i /><i /><i /><i /><i /></span>
          </div>
          <div className="how-compare-box">
            <small>{t.actual}</small>
            <strong>$9,680</strong>
            <span className="how-bars gold"><i /><i /><i /><i /><i /></span>
          </div>
          <div className="how-difference"><span>{t.difference}</span><b>+$1,260</b></div>
        </div>
        <h3>{t.steps[3][0]}</h3>
        <p>{t.steps[3][1]}</p>
        <CardFooter label={t.ctas[3]} />
      </article>

      <article className="how-pro-card">
        <StepNumber n={5} />
        <div className="how-pro-visual how-variance-visual">
          <div className="how-variance-top">
            <span className="how-alert-icon">!</span>
            <div><small>{t.variance}</small><strong>$1,260</strong><em>+14.1%</em></div>
          </div>
          <div className="how-variance-row"><span>{tx(locale, "🍗 Chicken", "🍗 Chicken")}</span><b>+18%</b><em>$480</em></div>
          <div className="how-variance-row"><span>{tx(locale, "🫒 Olive Oil", "🫒 Olive Oil")}</span><b>+22%</b><em>$320</em></div>
          <div className="how-variance-row"><span>{tx(locale, "🍅 Tomato", "🍅 Tomato")}</span><b>+12%</b><em>$280</em></div>
        </div>
        <h3>{t.steps[4][0]}</h3>
        <p>{t.steps[4][1]}</p>
        <CardFooter label={t.ctas[4]} />
      </article>

      <article className="how-pro-card">
        <StepNumber n={6} />
        <div className="how-pro-visual how-mobile-visual">
          <div className="how-phone">
            <div className="how-phone-notch" />
            <div className="how-phone-brand">COSTERA</div>
            <small>{t.today}</small>
            <strong>$8,320</strong>
            <span>↗ 12%</span>
            <div className="how-phone-chart"><i /><i /><i /><i /><i /><i /></div>
            <b>{tx(locale, "Food Cost 28.5%", "Food Cost 28.5%")}</b>
          </div>
          <div className="how-mobile-actions">
            <span>🔔 {t.alerts}</span>
            <span>▥ {t.reports}</span>
            <span>▣ {t.mobile}</span>
          </div>
        </div>
        <h3>{t.steps[5][0]}</h3>
        <p>{t.steps[5][1]}</p>
        <CardFooter label={t.ctas[5]} />
      </article>
    </div>
  );
}
