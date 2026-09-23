import { tx } from "@/lib/costera/locale";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { AppLanguageSwitcher } from "@/components/app/AppLanguageSwitcher";
import { getSessionContext, initials, roleLabel } from "@/lib/session";
import { signOutAction } from "@/lib/auth-actions";
import type { AppLocale } from "@/lib/costera/i18n";

const navGroups = [
  {
    en: "Command center",
    tr: "Kontrol merkezi",
    items: [
      ["/dashboard", "overview", "Overview", "Genel Bakış"],
      ["/dashboard/variance", "control", "Cost Control", "Maliyet Kontrolü"],
    ],
  },
  {
    en: "Operations",
    tr: "Operasyon",
    items: [
      ["/dashboard/inventory", "inventory", "Inventory", "Stok"],
      ["/dashboard/recipes", "recipe", "Recipes & Cost", "Reçeteler & Maliyet"],
      ["/dashboard/purchasing", "purchase", "Purchasing", "Satın Alma"],
      ["/dashboard/pos", "sales", "Sales & POS", "Satış & POS"],
      ["/dashboard/delivery", "channels", "Delivery & Channels", "Delivery & Kanallar"],
    ],
  },
  {
    en: "Intelligence",
    tr: "Analiz",
    items: [
      ["/dashboard/finance", "finance", "Finance", "Finans"],
      ["/dashboard/reports", "report", "Reports", "Raporlar"],
    ],
  },
  {
    en: "System",
    tr: "Sistem",
    items: [
      ["/dashboard/import", "import", "Data Import", "Veri Aktarımı"],
      ["/dashboard/integrations", "integration", "Integrations", "Entegrasyonlar"],
      ["/dashboard/settings", "settings", "Settings", "Ayarlar"],
    ],
  },
] as const;

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "overview") return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M14 18h7M17.5 14.5V21"/></svg>;
  if (name === "control") return <svg {...common}><path d="M4 17l4-5 4 3 6-8"/><path d="M17 7h3v3"/><circle cx="6" cy="18" r="2"/></svg>;
  if (name === "inventory") return <svg {...common}><path d="M4 7l8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/></svg>;
  if (name === "recipe") return <svg {...common}><path d="M6 3h10a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M8 8h6M8 12h7M8 16h4"/></svg>;
  if (name === "purchase") return <svg {...common}><path d="M3 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>;
  if (name === "sales") return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h5M8 16h2M15 16h1"/></svg>;
  if (name === "channels") return <svg {...common}><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.7 10.7 15.3 7.3M8.7 13.3l6.6 3.4"/></svg>;
  if (name === "finance") return <svg {...common}><path d="M12 3v18M17 7.5c0-1.9-2.2-3.3-5-3.3s-5 1.3-5 3.3 2 3 5 3 5 1.2 5 3.2-2.2 3.5-5 3.5-5-1.4-5-3.5"/></svg>;
  if (name === "report") return <svg {...common}><path d="M5 3h11l3 3v15H5z"/><path d="M16 3v4h4M8 17v-4M12 17V9M16 17v-6"/></svg>;
  if (name === "import") return <svg {...common}><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 19h16"/></svg>;
  if (name === "integration") return <svg {...common}><path d="M8 12h8M12 8v8"/><rect x="3" y="3" width="6" height="6" rx="2"/><rect x="15" y="15" width="6" height="6" rx="2"/><path d="M8 8l8 8"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>;
}

function MetricIcon({ label, tone }: { label: string; tone: string }) {
  const lower = label.toLowerCase();
  if (lower.includes("sales") || lower.includes("satış") || lower.includes("profit") || lower.includes("kâr")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16l5-5 4 3 7-8"/><path d="M16 6h4v4"/></svg>;
  }
  if (lower.includes("cost") || lower.includes("maliyet") || lower.includes("cogs")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v10M15 9.5c0-1.2-1.3-2-3-2s-3 .8-3 2 1.2 1.9 3 1.9 3 .7 3 1.9-1.3 2.2-3 2.2-3-.9-3-2.2"/></svg>;
  }
  if (lower.includes("variance") || lower.includes("unexplained") || lower.includes("fark") || tone === "bad") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 21 20H3L12 4Z"/><path d="M12 9v5M12 17h.01"/></svg>;
  }
  if (lower.includes("stock") || lower.includes("inventory") || lower.includes("stok")) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7l7-3 7 3-7 3-7-3Z"/><path d="M5 7v9l7 4 7-4V7M12 10v10"/></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9M12 19V5M19 19v-7"/></svg>;
}

export async function COSTERAAppShell({
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
  const ctx = await getSessionContext();
  const workspaceName = ctx?.restaurant?.name ?? (tx(locale, "Workspace", "Çalışma alanı"));
  const workspaceMeta = ctx?.restaurant?.city
    ? ctx.restaurant.city + " · " + ctx.locationCount + " " + (tx(locale, ctx.locationCount === 1 ? "location" : "locations", "şube"))
    : ctx?.locationCount + " " + (tx(locale, ctx && ctx.locationCount === 1 ? "location" : "locations", "şube"));
  const userName = ctx?.user.name ?? ctx?.user.email ?? (tx(locale, "User", "Kullanıcı"));
  const userInitials = initials(ctx?.user.name ?? null, ctx?.user.email ?? null);
  const workspaceInitials = initials(ctx?.restaurant?.name ?? null, null);

  return (
    <main className="costera-app premium-shell" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <aside className="costera-sidebar">
        <div className="costera-sidebar-top">
          <Link href="/dashboard" className="costera-sidebar-brand">
            <Brand compact />
          </Link>
          <div className="costera-product-badge">{tx(locale, "CONTROL SUITE", "KONTROL PAKETİ")}</div>
        </div>

        <div className="costera-workspace">
          <div className="workspace-avatar">{workspaceInitials}</div>
          <div>
            <span>{tx(locale, "WORKSPACE", "ÇALIŞMA ALANI")}</span>
            <strong>{workspaceName}</strong>
            <small>{workspaceMeta}</small>
          </div>
          <button aria-label="Switch workspace">⌄</button>
        </div>

        <nav className="costera-nav">
          {navGroups.map((group) => (
            <div className="costera-nav-group" key={group.en}>
              <small>{tx(locale, group.en, group.tr)}</small>
              {group.items.map(([href, icon, enLabel, trLabel]) => (
                <Link key={href} href={href} className={active === href ? "active" : ""}>
                  <i><NavIcon name={icon} /></i>
                  <span>{tx(locale, enLabel, trLabel)}</span>
                  {href === "/dashboard/variance" && <b>4</b>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="costera-sidebar-bottom">
          <div className="costera-sync-card">
            <div className="costera-sync-icon"><span /></div>
            <div>
              <strong>{tx(locale, "Data pipeline active", "Veri akışı aktif")}</strong>
              <small>{tx(locale, "Last sync: 2 min ago", "Son senkron: 2 dk önce")}</small>
            </div>
          </div>
          <Link href="/m" className="costera-mobile-link">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>
            {tx(locale, "Mobile monitor", "Mobil izleme")}
          </Link>
          <Link href={locale === "en" ? "/" : `/${locale}`}>← {tx(locale, "Back to website", "Web sitesine dön")}</Link>
        </div>
      </aside>

      <section className="costera-app-main">
        <header className="costera-topbar">
          <div className="costera-page-heading">
            <small>{eyebrow || (tx(locale, "COSTERA CONTROL CENTER", "COSTERA KONTROL MERKEZİ"))}</small>
            <h1>{title}</h1>
          </div>

          <div className="costera-topbar-actions">
            <label className="costera-location-select">
              <span>{tx(locale, "Location", "Şube")}</span>
              <select defaultValue="all">
                <option value="all">{tx(locale, "All locations", "Tüm şubeler")}</option>
                <option>Downtown</option>
                <option>Marina</option>
                <option>Jumeirah</option>
              </select>
            </label>

            <button className="costera-period">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>
              <span>Sep 1–22</span>
            </button>

            <div className="costera-live"><i /> {tx(locale, "Live", "Canlı")}</div>

            <button className="costera-icon-button" aria-label={tx(locale, "Notifications", "Bildirimler")}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
              <i />
            </button>

            <AppLanguageSwitcher locale={locale} />

            <div className="costera-user-block">
              <div className="costera-user">{userInitials}</div>
              <div>
                <strong>{userName}</strong>
                <small>{tx(locale, roleLabel(ctx?.role ?? null, false), roleLabel(ctx?.role ?? null, true))}</small>
              </div>
              <form action={signOutAction}>
                <button type="submit" className="costera-logout" aria-label={tx(locale, "Sign out", "Çıkış yap")} title={tx(locale, "Sign out", "Çıkış yap")}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>
                </button>
              </form>
            </div>
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
  const path =
    tone === "bad"
      ? "M2 18 C6 8, 10 20, 14 10 S22 12, 30 5"
      : tone === "good"
      ? "M2 17 C7 15, 9 10, 14 12 S21 5, 30 6"
      : tone === "gold"
      ? "M2 15 C8 7, 12 16, 18 9 S24 8, 30 4"
      : "M2 16 C7 12, 11 14, 16 9 S24 11, 30 6";

  return (
    <article className={"costera-metric " + tone}>
      <div className="costera-metric-head">
        <span>{label}</span>
        <div className="costera-metric-icon"><MetricIcon label={label} tone={tone} /></div>
      </div>
      <div className="costera-metric-main">
        <strong>{value}</strong>
        <svg className="costera-metric-spark" viewBox="0 0 32 22" preserveAspectRatio="none" aria-hidden="true">
          <path d={path} />
        </svg>
      </div>
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
  return <span className={"costera-status " + tone}><i />{children}</span>;
}
