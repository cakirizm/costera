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
    <section className="costera-empty-workspace premium-empty-state">
      <div className="premium-empty-copy">
        <span>{tr ? "CANLI KONTROL İÇİN HAZIR" : "READY FOR LIVE CONTROL"}</span>
        <h2>{title}</h2>
        <p>{text}</p>

        <div className="premium-empty-steps">
          <div><i>01</i><span><b>{tr ? "Kaynağı bağla" : "Connect a source"}</b><small>{tr ? "POS, delivery veya dosya" : "POS, delivery or file"}</small></span></div>
          <div><i>02</i><span><b>{tr ? "COSTERA eşleştirsin" : "Let COSTERA normalize"}</b><small>{tr ? "Tek operasyon modeline" : "Into one operating model"}</small></span></div>
          <div><i>03</i><span><b>{tr ? "Kontrolü canlı izle" : "See live control"}</b><small>{tr ? "Maliyet, fark ve aksiyon" : "Cost, variance and action"}</small></span></div>
        </div>

        <div className="costera-empty-actions">
          <Link href="/dashboard/integrations">{tr ? "Entegrasyonları Aç" : "Open Integrations"} <b>→</b></Link>
          <Link href="/dashboard/import" className="secondary">{tr ? "Dosya yükle" : "Upload files instead"}</Link>
        </div>
      </div>

      <div className="premium-empty-visual" aria-hidden="true">
        <div className="empty-visual-glow glow-one"/>
        <div className="empty-visual-glow glow-two"/>

        <svg className="empty-network-lines" viewBox="0 0 520 330" preserveAspectRatio="none">
          <path d="M78 74 C164 74 175 148 246 160"/>
          <path d="M78 165 C164 165 177 165 246 165"/>
          <path d="M78 256 C164 256 175 182 246 170"/>
          <path d="M326 165 C390 165 404 165 454 165"/>
        </svg>

        <div className="empty-visual-source source-one"><i>POS</i><span>{tr ? "Satış" : "Sales"}</span></div>
        <div className="empty-visual-source source-two"><i>R</i><span>{tr ? "Reçete" : "Recipes"}</span></div>
        <div className="empty-visual-source source-three"><i>S</i><span>{tr ? "Stok" : "Inventory"}</span></div>

        <div className="empty-visual-core">
          <div className="empty-core-ring ring-a"/>
          <div className="empty-core-ring ring-b"/>
          <b>C</b>
          <span>COSTERA</span>
          <small>{tr ? "Normalize · Analiz" : "Normalize · Analyze"}</small>
        </div>

        <div className="empty-visual-output">
          <div className="empty-output-head"><span>{tr ? "CANLI KONTROL" : "LIVE CONTROL"}</span><i /></div>
          <strong>28.2%</strong>
          <small>{tr ? "Gerçek Food Cost" : "Actual Food Cost"}</small>
          <div className="empty-output-bars"><i style={{height:"62%"}}/><i style={{height:"78%"}}/><i style={{height:"55%"}}/><i style={{height:"86%"}}/><i style={{height:"71%"}}/></div>
          <em>+3.2 pp</em>
        </div>
      </div>
    </section>
  );
}
