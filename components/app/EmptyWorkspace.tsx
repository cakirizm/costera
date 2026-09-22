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
      <div className="costera-empty-icon">⌁</div>
      <span>{tr ? "VERİ KAYNAĞI GEREKLİ" : "DATA SOURCE REQUIRED"}</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <div>
        <Link href="/dashboard/integrations">{tr ? "Entegrasyonları Aç" : "Open Integrations"}</Link>
        <Link href="/dashboard/import" className="secondary">{tr ? "Dosya yükle" : "Upload files instead"}</Link>
      </div>
    </section>
  );
}
