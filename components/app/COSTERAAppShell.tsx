import Link from "next/link";
import { Brand } from "@/components/Brand";
import { AppLanguageSwitcher } from "@/components/app/AppLanguageSwitcher";
import type { AppLocale } from "@/lib/costera/i18n";

const nav = [
  ["/dashboard", "◫", "Overview", "Genel Bakış"],
  ["/dashboard/variance", "△", "Cost Control", "Maliyet Kontrolü"],
  ["/dashboard/inventory", "▣", "Inventory", "Stok"],
  ["/dashboard/recipes", "≋", "Recipes & Cost", "Reçeteler & Maliyet"],
  ["/dashboard/purchasing", "▥", "Purchasing", "Satın Alma"],
  ["/dashboard/pos", "▤", "Sales & POS", "Satış & POS"],
  ["/dashboard/delivery", "⇄", "Delivery & Channels", "Delivery & Kanallar"],
  ["/dashboard/finance", "$", "Finance", "Finans"],
  ["/dashboard/reports", "▦", "Reports", "Raporlar"],
  ["/dashboard/import", "⇩", "Data Import", "Veri Aktarımı"],
  ["/dashboard/integrations", "⌁", "Integrations", "Entegrasyonlar"],
  ["/dashboard/settings", "⚙", "Settings", "Ayarlar"],
] as const;

export function COSTERAAppShell({
  active,
  title,
  eyebrow,
  locale = "en",
  children,
}: {
  active: string;
  title: string;
  eyebrow?: string;
  locale?: AppLocale;
  children: React.ReactNode;
}) {
  const tr = locale === "tr";

  return (
    <main className="costera-app">
      <aside className="costera-sidebar">
        <Link href="/dashboard" className="costera-sidebar-brand">
          <Brand compact />
        </Link>

        <div className="costera-workspace">
          <span>{tr ? "ÇALIŞMA ALANI" : "WORKSPACE"}</span>
          <strong>Demo Restaurant Group</strong>
          <small>Dubai · 3 {tr ? "şube" : "locations"}</small>
        </div>

        <nav className="costera-nav">
          {nav.map(([href, icon, enLabel, trLabel]) => (
            <Link key={href} href={href} className={active === href ? "active" : ""}>
              <i>{icon}</i>
              <span>{tr ? trLabel : enLabel}</span>
              {href === "/dashboard/variance" && <b>4</b>}
            </Link>
          ))}
        </nav>

        <div className="costera-sidebar-bottom">
          <div className="costera-data-status"><span /> {tr ? "Veri 2 dk önce senkronlandı" : "Data synced 2 min ago"}</div>
          <Link href="/">← {tr ? "Web sitesine dön" : "Back to website"}</Link>
        </div>
      </aside>

      <section className="costera-app-main">
        <header className="costera-topbar">
          <div>
            <small>{eyebrow || (tr ? "COSTERA KONTROL MERKEZİ" : "COSTERA CONTROL CENTER")}</small>
            <h1>{title}</h1>
          </div>

          <div className="costera-topbar-actions">
            <label className="costera-location-select">
              <span>{tr ? "Konum" : "Location"}</span>
              <select defaultValue="all">
                <option value="all">{tr ? "Tüm şubeler" : "All locations"}</option>
                <option>Downtown</option>
                <option>Marina</option>
                <option>Jumeirah</option>
              </select>
            </label>
            <button className="costera-period"><span>◷</span> Sep 1–22</button>
            <div className="costera-live"><i /> {tr ? "Canlı" : "Live"}</div>
            <AppLanguageSwitcher locale={locale} />
            <div className="costera-user">MC</div>
          </div>
        </header>

        <div className="costera-page">{children}</div>
      </section>
    </main>
  );
}

export function AppMetric({
  label,
  value,
  meta,
  tone = "neutral",
}: {
  label: string;
  value: string;
  meta: string;
  tone?: "neutral" | "good" | "bad" | "gold";
}) {
  return (
    <article className={`costera-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{meta}</small>
    </article>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "bad" | "warning";
}) {
  return <span className={`costera-status ${tone}`}>{children}</span>;
}
