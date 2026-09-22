import Link from "next/link";
import { Brand } from "@/components/Brand";

const nav = [
  ["/dashboard", "◫", "Overview"],
  ["/dashboard/variance", "△", "Cost Control"],
  ["/dashboard/inventory", "▣", "Inventory"],
  ["/dashboard/recipes", "≋", "Recipes & Cost"],
  ["/dashboard/purchasing", "▥", "Purchasing"],
  ["/dashboard/pos", "▤", "Sales & POS"],
  ["/dashboard/delivery", "⇄", "Delivery"],
  ["/dashboard/finance", "$", "Finance"],
  ["/dashboard/reports", "▦", "Reports"],
  ["/dashboard/import", "⇩", "Data Import"],
  ["/dashboard/integrations", "⌁", "Integrations"],
  ["/dashboard/settings", "⚙", "Settings"],
] as const;

export function COSTERAAppShell({
  active,
  title,
  eyebrow,
  children,
}: {
  active: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="costera-app">
      <aside className="costera-sidebar">
        <Link href="/dashboard" className="costera-sidebar-brand">
          <Brand compact />
        </Link>

        <div className="costera-workspace">
          <span>WORKSPACE</span>
          <strong>Demo Restaurant Group</strong>
          <small>Dubai · 3 locations</small>
        </div>

        <nav className="costera-nav">
          {nav.map(([href, icon, label]) => (
            <Link key={href} href={href} className={active === href ? "active" : ""}>
              <i>{icon}</i>
              <span>{label}</span>
              {href === "/dashboard/variance" && <b>4</b>}
            </Link>
          ))}
        </nav>

        <div className="costera-sidebar-bottom">
          <div className="costera-data-status"><span /> Data synced 2 min ago</div>
          <Link href="/">← Back to website</Link>
        </div>
      </aside>

      <section className="costera-app-main">
        <header className="costera-topbar">
          <div>
            <small>{eyebrow || "COSTERA CONTROL CENTER"}</small>
            <h1>{title}</h1>
          </div>

          <div className="costera-topbar-actions">
            <label className="costera-location-select">
              <span>Location</span>
              <select defaultValue="all">
                <option value="all">All locations</option>
                <option>Downtown</option>
                <option>Marina</option>
                <option>Jumeirah</option>
              </select>
            </label>
            <button className="costera-period"><span>◷</span> Sep 1–22</button>
            <div className="costera-live"><i /> Live</div>
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
