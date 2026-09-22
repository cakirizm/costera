import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const modules = [
  ["Teorik vs. Gerçek Tüketim", "Reçeteye göre beklenen tüketimi gerçek stok kullanımıyla malzeme, şube ve dönem bazında karşılaştırın."],
  ["Açıklanamayan Stok Farkı", "Onaylı fire ve bilinen düzeltmeleri ayırın; açıklanamayan miktar ve para farkını görün."],
  ["Canlı Reçete Maliyeti", "Satın alma maliyetleri değiştikçe reçete maliyetini yeniden hesaplayın ve hedef food cost ile karşılaştırın."],
  ["Stok Görünürlüğü", "Açılış, giriş, transfer, sayım ve tüketimi aynı operasyon modeli içinde izleyin."],
  ["Satın Alma Maliyet Takibi", "Tedarikçi fiyat değişimlerini görün ve hangi menü ürünlerinin en çok etkilendiğini anlayın."],
  ["Delivery Kanal Ekonomisi", "Mevcut veri izin verdiği ölçüde ciro, indirim, komisyon, food cost ve katkıyı kanal bazında karşılaştırın."],
  ["Çok Şubeli Karşılaştırma", "Her şubenin operasyonel bağlamını koruyarak cost ve farkları şube bazında inceleyin."],
  ["İstisna Takibi", "Eşleşmeyen ürünler, eksik reçeteler, birim hataları, olağandışı stok farkları ve entegrasyon sorunlarına odaklanın."],
  ["Mobil Yönetim Görünümü", "Teknik kurulum ekranları yerine yalnızca dikkat gerektiren rakamları telefondan sade biçimde görün."],
];

export default function TurkishFeaturesPage() {
  return (
    <>
      <SiteHeader locale="tr" path="/features" />
      <main>
        <section className="page-hero">
          <div className="shell narrow">
            <div className="eyebrow">ÖZELLİKLER</div>
            <h1>Restoran operasyonlarının etrafında tasarlanmış maliyet zekâsı.</h1>
            <p>
              Her modül aynı ana soruya hizmet eder: stoğa ne girdi, ne kadar tüketilmeliydi,
              gerçekte ne kadar tüketildi ve fark nereden geldi?
            </p>
          </div>
        </section>

        <section className="section">
          <div className="shell module-grid">
            {modules.map(([title, copy], i) => (
              <article className="module-card" key={title}>
                <span className="module-index">{String(i + 1).padStart(2, "0")}</span>
                <h2>{title}</h2><p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section soft-section">
          <div className="shell two-col">
            <div>
              <div className="eyebrow">ESNEK YAPI</div>
              <h2>Restoran değişir. Kontrol mantığı değişmez.</h2>
            </div>
            <div className="copy-stack">
              <p>Her restoran farklı POS, stok, satın alma ve muhasebe sistemi kullanabilir. COSTERA işletmeyi tek bir operasyon biçimine zorlamadan gelen veriyi standartlaştırır.</p>
              <p>Hedefler, birimler, reçete kuralları, dağıtım tercihleri ve şube yapısı firma bazında ayarlanabilir.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell centered-cta">
            <Link className="button button-gold" href="/tr/demo">COSTERA&apos;yı Görün</Link>
          </div>
        </section>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
