import { Brand } from "@/components/Brand";
import Link from "next/link";

export default function TurkishDemoPage() {
  return (
    <main className="demo-page">
      <div className="shell demo-topbar">
        <Link href="/tr"><Brand /></Link>
        <div className="demo-top-actions">
          <Link href="/demo" className="language-switch">EN</Link>
          <Link href="/tr" className="text-link">Siteye dön</Link>
        </div>
      </div>
      <div className="shell demo-grid">
        <section>
          <div className="eyebrow">DEMO İSTE</div>
          <h1>COSTERA&apos;yı kendi restoran akışınızla görün.</h1>
          <p>
            POS, stok ve reçeteleri bugün nasıl yönettiğinizi paylaşın.
            Demo akışını işletmenize en uygun şekilde hazırlayalım.
          </p>
          <div className="demo-points">
            <span>✓ Cost & fark analizi akışı</span>
            <span>✓ POS ve stok entegrasyon değerlendirmesi</span>
            <span>✓ Şube ve reçete kurulum görüşmesi</span>
          </div>
        </section>
        <form className="demo-form">
          <label>Ad Soyad<input placeholder="Adınız" /></label>
          <label>İş e-postası<input type="email" placeholder="isim@restoran.com" /></label>
          <label>Restoran / grup<input placeholder="Restoran adı" /></label>
          <label>Şube sayısı<select defaultValue="1"><option>1</option><option>2-3</option><option>4-10</option><option>10+</option></select></label>
          <label>Kullandığınız POS<input placeholder="Biliyorsanız POS sağlayıcısı" /></label>
          <button className="button button-gold full-button" type="button">Demo İste</button>
          <small>Bu test yayını sırasında demo talep formu önizleme modundadır.</small>
        </form>
      </div>
    </main>
  );
}
