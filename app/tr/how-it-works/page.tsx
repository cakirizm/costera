import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  ["Mevcut sistemlerinizi bağlayın", "COSTERA POS'a ve mevcut olduğu yerde stok, satın alma ve delivery kaynaklarına bağlanır. Kullandığınız sistemler operasyonel kaynak olmaya devam eder."],
  ["Menü ve reçeteleri eşleştirin", "Menü ürünleri reçetelerle eşleşir; böylece her satışın ne kadar malzeme tüketmesi gerektiği hesaplanabilir."],
  ["Stok hareketlerini okuyun", "Açılış stoku, satın almalar, transferler, onaylı fire ve kapanış sayımları gerçek kullanım görünümünü oluşturur."],
  ["Teorik tüketimi hesaplayın", "Satış adedi reçete miktarlarıyla çarpılarak her malzemenin ne kadar tüketilmesi gerektiği hesaplanır."],
  ["Gerçek ve teorik kullanımı karşılaştırın", "Onaylı düzeltmeler sonrası gerçek stok kullanımı ile beklenen tüketim arasındaki fark bulunur."],
  ["Farkın parasal etkisini görün", "Sapma miktar ve para değerine çevrilir; hangi malzeme ve dönemin incelenmesi gerektiği netleşir."],
];

export default function TurkishHowItWorksPage() {
  return (
    <>
      <SiteHeader locale="tr" path="/how-it-works" />
      <main>
        <section className="page-hero page-hero-photo">
          <div className="shell narrow">
            <div className="eyebrow">NASIL ÇALIŞIR?</div>
            <h1>Basit entegrasyon. Net maliyet kontrolü.</h1>
            <p>
              COSTERA restoranınızın çalışma şeklini değiştirmez. Operasyon verisini okur,
              doğrular ve anlamlandırır; cost ve stok performansını daha net görmenizi sağlar.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="shell process-list">
            {steps.map(([title, copy], i) => (
              <article className="process-item" key={title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div><h2>{title}</h2><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section soft-section">
          <div className="shell two-col">
            <div>
              <div className="eyebrow">ÇİFT VERİ GİRİŞİ YOK</div>
              <h2>Ekibiniz zaten bildiği sistemlerde çalışmaya devam eder.</h2>
            </div>
            <div className="copy-stack">
              <p>Satışlar POS'a, satın almalar mevcut stok veya satın alma sistemine girilmeye devam eder.</p>
              <p>COSTERA bu sistemlerin üzerinde çalışır, veriyi standartlaştırır ve aynı bilgiyi tekrar girmenizi istemek yerine yalnızca istisnalara odaklanır.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell action-banner">
            <div><h2>Kendi restoran verinizle akışı görün.</h2><p>Bir şubeyle başlayın, veriyi doğrulayın, sonra ölçekleyin.</p></div>
            <Link className="button button-gold" href="/tr/demo">Demo İste</Link>
          </div>
        </section>
      </main>
      <SiteFooter locale="tr" />
    </>
  );
}
