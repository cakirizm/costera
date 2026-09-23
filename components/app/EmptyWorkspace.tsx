import { tx } from "@/lib/costera/locale";
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

  return (
    <section className="costera-empty-workspace premium-empty-state">
      <div className="premium-empty-copy">
        <span>{tx(locale, "READY FOR LIVE CONTROL", "CANLI KONTROL İÇİN HAZIR")}</span>
        <h2>{title}</h2>
        <p>{text}</p>

        <div className="premium-empty-steps">
          <div><i>01</i><span><b>{tx(locale, "Connect a source", "Kaynağı bağla")}</b><small>{tx(locale, "POS, delivery or file", "POS, delivery veya dosya")}</small></span></div>
          <div><i>02</i><span><b>{tx(locale, "Let COSTERA normalize", "COSTERA eşleştirsin")}</b><small>{tx(locale, "Into one operating model", "Tek operasyon modeline")}</small></span></div>
          <div><i>03</i><span><b>{tx(locale, "See live control", "Kontrolü canlı izle")}</b><small>{tx(locale, "Cost, variance and action", "Maliyet, fark ve aksiyon")}</small></span></div>
        </div>

        <div className="costera-empty-actions">
          <Link href="/dashboard/integrations">{tx(locale, "Open Integrations", "Entegrasyonları Aç")} <b>→</b></Link>
          <Link href="/dashboard/import" className="secondary">{tx(locale, "Upload files instead", "Dosya yükle")}</Link>
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

        <div className="empty-visual-source source-one"><i>POS</i><span>{tx(locale, "Sales", "Satış")}</span></div>
        <div className="empty-visual-source source-two"><i>R</i><span>{tx(locale, "Recipes", "Reçete")}</span></div>
        <div className="empty-visual-source source-three"><i>S</i><span>{tx(locale, "Inventory", "Stok")}</span></div>

        <div className="empty-visual-core">
          <div className="empty-core-ring ring-a"/>
          <div className="empty-core-ring ring-b"/>
          <b>C</b>
          <span>COSTERA</span>
          <small>{tx(locale, "Normalize · Analyze", "Normalize · Analiz")}</small>
        </div>

        <div className="empty-visual-output">
          <div className="empty-output-head"><span>{tx(locale, "LIVE CONTROL", "CANLI KONTROL")}</span><i /></div>
          <strong>28.2%</strong>
          <small>{tx(locale, "Actual Food Cost", "Gerçek Food Cost")}</small>
          <div className="empty-output-bars"><i style={{height:"62%"}}/><i style={{height:"78%"}}/><i style={{height:"55%"}}/><i style={{height:"86%"}}/><i style={{height:"71%"}}/></div>
          <em>+3.2 pp</em>
        </div>
      </div>
    </section>
  );
}
