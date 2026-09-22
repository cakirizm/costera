import Link from "next/link";
import { DashboardMock } from "@/components/DashboardMock";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const cards = [
  ["Stok Kontrolü", "Stok durumunu, birim maliyetleri ve açıklanamayan miktar farklarını takip edin.", "inventory"],
  ["Reçete & Food Cost", "Satın alma fiyatları değiştikçe reçete maliyetini yeniden hesaplayın ve hedef food cost ile karşılaştırın.", "recipe"],
  ["Satın Alma", "Tedarikçi fiyat değişimlerini görün ve hangi menü ürünlerinin etkilendiğini anlayın.", "purchase"],
  ["Delivery Kanal Analizi", "Restoran içi ve delivery kanallarının ekonomisini tek yönetim ekranında karşılaştırın.", "delivery"],
  ["Teorik vs. Gerçek Tüketim", "Reçeteye göre beklenen kullanım ile stoğun gerçekten tükettiği miktarı karşılaştırın.", "variance"],
  ["Mobil Yönetim Görünümü", "Dikkat gerektiren rakamları bilgisayar, tablet veya telefondan inceleyin.", "mobile"],
  ["Uyarılar & İstisna Takibi", "Olağandışı kullanım, hedef aşımı, eksik reçete ve entegrasyon sorunlarını öne çıkarın.", "alerts"],
];

function FeatureVisual({ type }: { type: string }) {
  if (type === "inventory") return <div className="feature-mini-table"><span>Bonfile <b>12.5 kg</b><em>$230</em></span><span>Mozzarella <b>8.0 kg</b><em>$49.60</em></span><span>Domates <b>4.0 kg</b><em>$8.40</em></span></div>;
  if (type === "recipe") return <div className="feature-recipe"><div>◎</div><section><b>Trüflü Makarna</b><span>Reçete Cost $4.21</span><span>Hedef 28.0%</span><em>Gerçek 34.5%</em></section></div>;
  if (type === "purchase") return <div className="feature-purchases"><span>Metro <b>$1,240</b></span><span>Bidfood <b>$980</b></span><span>Fresh Supply <b>$640</b></span></div>;
  if (type === "delivery") return <div className="feature-channel"><span>Restoran içi <b>22.4%</b></span><span>Delivery <b>12.1%</b></span><span>Takeaway <b>18.7%</b></span></div>;
  if (type === "variance") return <div className="feature-variance"><span>Tavuk <b>50.0</b><em>62.8</em><i>+25.6%</i></span><span>Zeytinyağı <b>18.0</b><em>21.4</em><i>+18.9%</i></span><span>Mozzarella <b>20.0</b><em>18.2</em><u>-9.0%</u></span></div>;
  if (type === "mobile") return <div className="feature-phone"><small>Bugün</small><strong>$6,240</strong><span>Food Cost 28.9%</span><b>Net Marj 17.5%</b></div>;
  return <div className="feature-alerts"><span>Tavuk tüketimi beklenenden %25.6 yüksek.</span><span>Trüflü Makarna food cost hedefin üzerinde.</span><span>Mozzarella stoku minimuma yaklaşıyor.</span></div>;
}

export default function TurkishFeaturesPage() {
  return (
    <>
      <SiteHeader locale="tr" path="/features" />
      <main>
        <section className="feature-hero">
          <div className="feature-hero-photo" />
          <div className="shell feature-hero-grid">
            <div>
              <div className="eyebrow">TÜM OPERASYONUNUZ TEK GÖRÜNÜMDE</div>
              <h1>Kârlı restoranlar veriyle yönetilir.</h1>
              <p>
                COSTERA stok, reçete, satın alma, satış ve delivery kanallarındaki maliyet
                hareketlerini görünür hale getirir; marj kaybolmadan aksiyon almanızı kolaylaştırır.
              </p>
              <div className="hero-actions">
                <Link className="button button-gold" href="/tr/demo">Demo İste <span>→</span></Link>
                <Link className="button button-outline" href="/tr/how-it-works">Nasıl Çalışır?</Link>
              </div>
              <div className="trust-row"><span>Gerçek zamanlı görünürlük</span><span>Kolay kontrol</span><span>Restoranlar için tasarlandı</span></div>
            </div>
            <div className="feature-hero-dashboard"><DashboardMock locale="tr" /></div>
          </div>
        </section>

        <section className="section feature-section">
          <div className="shell feature-section-heading">
            <div>
              <div className="eyebrow">COSTERA NELERİ KONTROL EDER?</div>
              <h2>Marjınızı şekillendiren süreçleri görünür tutun.</h2>
            </div>
            <p>
              COSTERA food cost, stok farkı ve kanal kârlılığının arkasındaki operasyon sinyallerini
              tek ve tutarlı bir yönetim görünümünde birleştirir.
            </p>
          </div>

          <div className="shell feature-showcase-grid">
            {cards.map(([title, copy, type], index) => (
              <article className={`feature-showcase-card ${index === 4 || index === 6 ? "feature-wide" : ""}`} key={title}>
                <div className="feature-card-heading">
                  <span className="feature-card-icon">{String(index + 1).padStart(2,"0")}</span>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                </div>
                <FeatureVisual type={type} />
              </article>
            ))}
          </div>
        </section>

        <section className="proof-strip">
          <div className="shell proof-strip-inner">
            <div className="proof-quote">
              <div className="proof-avatar">JD</div>
              <p>“Değer başka bir rapor değil; maliyetin nereye gittiğini ay sonunu beklemeden görebilmek.”</p>
              <small>Operasyon Direktörü · Çok Şubeli Restoran Grubu</small>
            </div>
            <div className="proof-stat"><strong>↓</strong><b>Daha net stok kontrolü</b><span>Bağlı tüm şubelerde</span></div>
            <div className="proof-stat"><strong>24/7</strong><b>Yönetim görünürlüğü</b><span>Bilgisayar, tablet ve mobil</span></div>
            <div className="proof-stat"><strong>1</strong><b>Tek operasyon görünümü</b><span>Stok, reçete, satış ve delivery</span></div>
          </div>
        </section>

        <section className="feature-bottom-cta">
          <div className="shell feature-bottom-inner">
            <div>
              <div className="eyebrow eyebrow-light">DAHA KONTROLLÜ BİR OPERASYON KURUN</div>
              <h2>Restoran verisini kolay kontrole dönüştürün.</h2>
              <p>Elinizdeki verilerle başlayın ve ihtiyaç oldukça genişletin.</p>
            </div>
            <div className="hero-actions">
              <Link className="button button-gold" href="/tr/demo">Demo İste</Link>
              <Link className="button button-ghost" href="/tr/pricing">Fiyatlandırmayı Gör</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
