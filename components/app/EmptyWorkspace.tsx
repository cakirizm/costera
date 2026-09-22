import Link from "next/link";
import type { AppLocale } from "@/lib/costera/i18n";

export function EmptyWorkspace({
  title = "No live data connected yet.",
  text = "Connect a POS source or start the Universal POS Demo to populate this workspace.",
  locale = "en",
}: {
  title?: string;
  text?: string;
  locale?: AppLocale;
}) {
  const tr = locale === "tr";

  return (
    <section className="costera-empty-workspace">
      <div className="costera-empty-visual" aria-hidden="true">
        <div className="empty-source source-pos"><i>POS</i><span>{tr ? "Satış" : "Sales"}</span></div>
        <div className="empty-source source-recipe"><i>R</i><span>{tr ? "Reçete" : "Recipes"}</span></div>
        <div className="empty-source source-stock"><i>S</i><span>{tr ? "Stok" : "Inventory"}</span></div>
        <svg viewBox="0 0 360 130" preserveAspectRatio="none">
          <path d="M58 30 C115 30,118 65,160 65"/>
          <path d="M58 100 C115 100,118 65,160 65"/>
          <path d="M300 65 C250 65,246 65,202 65"/>
        </svg>
        <div className="empty-costera-core">
          <b>C</b>
          <span>COSTERA</span>
          <small>{tr ? "Normalize et · Analiz et" : "Normalize · Analyze"}</small>
        </div>
        <div className="empty-result">
          <i />
          <span>{tr ? "Canlı kontrol" : "Live control"}</span>
        </div>
      </div>

      <span>{tr ? "VERİ KAYNAĞI GEREKLİ" : "DATA SOURCE REQUIRED"}</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="costera-empty-actions">
        <Link href="/dashboard/integrations">{tr ? "Entegrasyonları Aç" : "Open Integrations"}</Link>
        <Link href="/dashboard/import" className="secondary">{tr ? "Dosya yükle" : "Upload files instead"}</Link>
      </div>
    </section>
  );
}
