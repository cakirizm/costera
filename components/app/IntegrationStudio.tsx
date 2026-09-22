"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AppLocale } from "@/lib/costera/i18n";

type Preview = {
  provider: string;
  mode: string;
  syncedAt: string;
  records: { sales: number; menuItems: number; ingredients: number; inventoryRows: number };
  totals: { netSales: number; actualFoodCostPct: number; unexplainedCost: number };
};

type Status = { connected: boolean; preview?: Preview };
type ConnectorType = "POS" | "Delivery" | "Accounting / ERP" | "Inventory / Back Office";
type ConnectionMethod = "REST API" | "Webhook" | "SFTP / CSV" | "Database Read-only" | "Other";
type AuthMethod = "API Key" | "Bearer Token" | "OAuth 2.0" | "Basic Auth" | "Other";

type ConnectorDraft = {
  id: string;
  type: ConnectorType;
  providerName: string;
  docsUrl: string;
  method: ConnectionMethod;
  baseUrl: string;
  auth: AuthMethod;
  accountId: string;
  notes: string;
  capabilities: string[];
  createdAt: string;
};

const CAPABILITIES = [
  "Sales & order lines",
  "Menu items",
  "Recipes / BOM",
  "Inventory balances",
  "Purchases / receipts",
  "Waste",
  "Transfers",
  "Delivery channel",
  "Platform fees",
  "Settlements / payouts",
];

const EMPTY_DRAFT: Omit<ConnectorDraft, "id" | "createdAt"> = {
  type: "POS",
  providerName: "",
  docsUrl: "",
  method: "REST API",
  baseUrl: "",
  auth: "API Key",
  accountId: "",
  notes: "",
  capabilities: ["Sales & order lines", "Menu items", "Recipes / BOM", "Inventory balances"],
};

export function IntegrationStudio({ locale = "en" }: { locale?: AppLocale }) {
  const tr = locale === "tr";
  const t = (en: string, turkish: string) => (tr ? turkish : en);

  const [status, setStatus] = useState<Status>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [savedDrafts, setSavedDrafts] = useState<ConnectorDraft[]>([]);
  const [coverage, setCoverage] = useState({ orders: false, fees: false, settlements: false });

  useEffect(() => {
    const raw = window.localStorage.getItem("costera_connector_drafts");
    if (raw) {
      try { setSavedDrafts(JSON.parse(raw)); } catch { setSavedDrafts([]); }
    }
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/pos-demo", { cache: "no-store" });
      const payload = await response.json();
      setStatus({ connected: Boolean(payload.connected), preview: payload.preview });
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const demoAction = async (name: "connect" | "sync" | "disconnect" | "reset") => {
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/pos-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: name }),
      });
      const payload = await response.json();
      setStatus({ connected: Boolean(payload.connected), preview: payload.preview });
      if (name === "connect") setMessage(t("Universal POS Demo connected. Overview and Cost Control are now populated through the same adapter pattern used by real connectors.","Universal POS Demo bağlandı. Genel Bakış ve Maliyet Kontrolü artık gerçek connector mimarisiyle aynı adapter akışından veri alıyor."));
      if (name === "sync") setMessage(t("Demo source synced successfully.","Demo kaynağı başarıyla senkronlandı."));
      if (name === "disconnect") setMessage(t("Demo source disconnected. Live-data dashboards are empty again.","Demo kaynağı bağlantısı kesildi. Canlı veri ekranları tekrar boş."));
      if (name === "reset") setMessage(t("Workspace connection reset.","Çalışma alanı bağlantısı sıfırlandı."));
    } catch {
      setMessage(t("Connection action failed.","Bağlantı işlemi başarısız oldu."));
    } finally { setLoading(false); }
  };

  const openBuilder = (type: ConnectorType) => {
    setDraft({
      ...EMPTY_DRAFT,
      type,
      capabilities:
        type === "Delivery"
          ? ["Delivery channel", "Platform fees", "Settlements / payouts"]
          : type === "Accounting / ERP"
          ? ["Purchases / receipts"]
          : [...EMPTY_DRAFT.capabilities],
    });
    setBuilderOpen(true);
    setMessage("");
  };

  const toggleCapability = (capability: string) => {
    setDraft((current) => ({
      ...current,
      capabilities: current.capabilities.includes(capability)
        ? current.capabilities.filter((item) => item !== capability)
        : [...current.capabilities, capability],
    }));
  };

  const saveDraft = () => {
    if (!draft.providerName.trim()) {
      setMessage(t("Enter the provider/system name first.","Önce sağlayıcı / sistem adını girin."));
      return;
    }

    const connector: ConnectorDraft = {
      ...draft,
      id: String(Date.now()),
      providerName: draft.providerName.trim(),
      createdAt: new Date().toISOString(),
    };

    const next = [connector, ...savedDrafts];
    setSavedDrafts(next);
    window.localStorage.setItem("costera_connector_drafts", JSON.stringify(next));
    setMessage(
      tr
        ? connector.providerName + " connector talebi olarak kaydedildi. Henüz bağlı DEĞİL. API dokümanını veya firma cevabını COSTERA geliştirme tarafına verdiğinizde hesap motorunu değiştirmeden adapter eklenebilir."
        : connector.providerName + " saved as a connector request. It is NOT connected yet. Send COSTERA the API documentation or vendor response and an adapter can be added without changing the calculation engine."
    );
    setBuilderOpen(false);
  };

  const removeDraft = (id: string) => {
    const next = savedDrafts.filter((item) => item.id !== id);
    setSavedDrafts(next);
    window.localStorage.setItem("costera_connector_drafts", JSON.stringify(next));
  };

  const downloadDraft = (item: ConnectorDraft) => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "costera-connector-" + item.providerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deliveryVerdict = useMemo(() => {
    if (coverage.orders && coverage.fees && coverage.settlements) {
      return {
        tone: "good",
        title: t("Separate delivery connector probably not required.","Ayrı delivery connector büyük ihtimalle gerekli değil."),
        text: t("Your POS appears to provide delivery orders, platform fees and settlement data. COSTERA can use the POS as the single source.","POS sistemi delivery siparişleri, platform ücretleri ve settlement verisini sağlıyor görünüyor. COSTERA tek kaynak olarak POS'u kullanabilir."),
      };
    }
    if (coverage.orders && (!coverage.fees || !coverage.settlements)) {
      return {
        tone: "warning",
        title: t("Use POS for orders; connect delivery only for the missing financial data.","Siparişleri POS'tan al; sadece eksik finansal veri için delivery bağla."),
        text: t("This avoids duplicate order feeds while still bringing commissions, fees or payouts into COSTERA.","Böylece sipariş verisini iki kez çekmeden komisyon, ücret veya payout verisini COSTERA'ya alırsın."),
      };
    }
    return {
      tone: "neutral",
      title: t("Delivery connector may be required.","Delivery connector gerekebilir."),
      text: t("If the POS does not expose delivery orders or financial deductions, add the delivery platform or aggregator as another source.","POS delivery siparişlerini veya finansal kesintileri vermiyorsa delivery platformunu ya da aggregator'ı ayrı kaynak olarak ekleyin."),
    };
  }, [coverage, tr]);

  const capLabel = (cap: string) => {
    const map: Record<string,string> = {
      "Sales & order lines":"Satış & sipariş satırları",
      "Menu items":"Menü ürünleri",
      "Recipes / BOM":"Reçete / BOM",
      "Inventory balances":"Stok bakiyeleri",
      "Purchases / receipts":"Satın alma / mal kabul",
      "Waste":"Fire / zayi",
      "Transfers":"Transferler",
      "Delivery channel":"Delivery kanalı",
      "Platform fees":"Platform ücretleri",
      "Settlements / payouts":"Settlement / ödemeler",
    };
    return tr ? map[cap] || cap : cap;
  };

  return (
    <div className="integration-studio-v3">
      <section className="integration-architecture">
        <div>
          <span>{t("UNIVERSAL CONNECTOR ARCHITECTURE","UNIVERSAL CONNECTOR MİMARİSİ")}</span>
          <h2>{t("Any POS. Any delivery platform. One COSTERA model.","Her POS. Her delivery platformu. Tek COSTERA modeli.")}</h2>
          <p>{t("COSTERA is not tied to Polaris, Talabat, Deliveroo or any other vendor. A provider adapter only converts that vendor's data into COSTERA's standard sales, recipe, inventory, purchasing and settlement model.","COSTERA Polaris, Talabat, Deliveroo veya başka bir firmaya bağlı değildir. Sağlayıcı adapter'ı sadece o firmanın verisini COSTERA'nın standart satış, reçete, stok, satın alma ve settlement modeline dönüştürür.")}</p>
        </div>
        <div className="integration-architecture-flow">
          <div><b>{t("Any source","Her kaynak")}</b><small>POS · Delivery · ERP</small></div><i>→</i>
          <div><b>{t("Provider adapter","Sağlayıcı adapter")}</b><small>API · Webhook · SFTP</small></div><i>→</i>
          <div><b>{t("COSTERA model","COSTERA modeli")}</b><small>{t("Normalized data","Normalize veri")}</small></div><i>→</i>
          <div className="active"><b>{t("Cost Control","Maliyet Kontrolü")}</b><small>{t("Same engine every time","Her zaman aynı motor")}</small></div>
        </div>
      </section>

      <section className="integration-source-types">
        <article>
          <div className="integration-source-icon">POS</div>
          <div><span>{t("PRIMARY SOURCE","ANA KAYNAK")}</span><h3>{t("Add any POS system","Herhangi bir POS ekle")}</h3><p>{t("Polaris, Foodics, Oracle, Toast, Lightspeed or any other vendor.","Polaris, Foodics, Oracle, Toast, Lightspeed veya başka herhangi bir POS.")}</p></div>
          <button type="button" onClick={() => openBuilder("POS")}>+ {t("Add POS","POS Ekle")}</button>
        </article>

        <article>
          <div className="integration-source-icon">DL</div>
          <div><span>{t("OPTIONAL SOURCE","OPSİYONEL KAYNAK")}</span><h3>{t("Add any delivery platform","Herhangi bir delivery platformu ekle")}</h3><p>{t("Only needed when your POS does not already provide the required delivery data.","Sadece POS gerekli delivery verisini zaten vermiyorsa gerekir.")}</p></div>
          <button type="button" onClick={() => openBuilder("Delivery")}>+ {t("Add Delivery","Delivery Ekle")}</button>
        </article>

        <article>
          <div className="integration-source-icon">ERP</div>
          <div><span>{t("OPTIONAL SOURCE","OPSİYONEL KAYNAK")}</span><h3>{t("Accounting / ERP","Muhasebe / ERP")}</h3><p>{t("Add expenses, purchasing or accounting data from any back-office system.","Herhangi bir back-office sisteminden gider, satın alma veya muhasebe verisi ekleyin.")}</p></div>
          <button type="button" onClick={() => openBuilder("Accounting / ERP")}>+ {t("Add ERP","ERP Ekle")}</button>
        </article>
      </section>

      <section className="integration-demo-card">
        <div>
          <span>{t("SAFE TEST CONNECTOR","GÜVENLİ TEST CONNECTOR")}</span>
          <h2>Universal POS Demo</h2>
          <p>{t("Test the full integration path without pretending a real vendor is connected. This demo uses the same normalize → calculate → dashboard flow.","Gerçek bir firma bağlıymış gibi göstermeden tüm entegrasyon akışını test edin. Demo aynı normalize → hesapla → dashboard akışını kullanır.")}</p>
        </div>
        <div className="integration-demo-actions">
          {!status.connected ? (
            <button className="primary" type="button" onClick={() => demoAction("connect")} disabled={loading}>{t("Start Demo Feed","Demo Akışını Başlat")}</button>
          ) : (
            <>
              <button className="primary" type="button" onClick={() => demoAction("sync")} disabled={loading}>{t("Sync now","Şimdi senkronla")}</button>
              <button type="button" onClick={() => demoAction("disconnect")} disabled={loading}>{t("Disconnect","Bağlantıyı Kes")}</button>
            </>
          )}
          <button type="button" onClick={() => demoAction("reset")} disabled={loading}>{t("Reset","Sıfırla")}</button>
        </div>
      </section>

      {message && <div className="integration-message">{message}</div>}

      <section className="integration-delivery-check">
        <div className="integration-delivery-head">
          <div>
            <span>{t("DELIVERY DECISION","DELIVERY KARARI")}</span>
            <h2>{t("Check the POS before adding delivery connectors.","Delivery connector eklemeden önce POS'u kontrol et.")}</h2>
            <p>{t("If the POS already gives COSTERA these fields, we should not duplicate the feed.","POS bu alanları zaten COSTERA'ya veriyorsa aynı veriyi ikinci kez çekmemeliyiz.")}</p>
          </div>
        </div>

        <div className="integration-coverage-grid">
          <label><input type="checkbox" checked={coverage.orders} onChange={(e) => setCoverage({ ...coverage, orders: e.target.checked })} /><span><b>{t("Delivery orders & channels","Delivery siparişleri & kanallar")}</b><small>{t("Orders identified by platform/channel","Platform / kanal bazında ayrılmış siparişler")}</small></span></label>
          <label><input type="checkbox" checked={coverage.fees} onChange={(e) => setCoverage({ ...coverage, fees: e.target.checked })} /><span><b>{t("Platform fees / commission","Platform ücretleri / komisyon")}</b><small>{t("Commission and deductions per platform","Platform bazlı komisyon ve kesintiler")}</small></span></label>
          <label><input type="checkbox" checked={coverage.settlements} onChange={(e) => setCoverage({ ...coverage, settlements: e.target.checked })} /><span><b>{t("Settlements / payouts","Settlement / ödemeler")}</b><small>{t("What the platform actually paid","Platformun gerçekten ödediği tutar")}</small></span></label>
        </div>

        <div className={"integration-delivery-verdict " + deliveryVerdict.tone}>
          <b>{deliveryVerdict.title}</b><span>{deliveryVerdict.text}</span>
        </div>
      </section>

      {builderOpen && (
        <section className="connector-builder">
          <div className="connector-builder-head">
            <div><span>{t("NEW CONNECTOR REQUEST","YENİ CONNECTOR TALEBİ")}</span><h2>{draft.type}</h2><p>{t("Enter whatever the vendor gives you. Missing fields can stay empty until their technical team responds.","Firma sana ne verdiyse gir. Eksik alanlar teknik ekip cevap verene kadar boş kalabilir.")}</p></div>
            <button type="button" onClick={() => setBuilderOpen(false)}>{t("Close","Kapat")}</button>
          </div>

          <div className="connector-builder-grid">
            <label>{t("Provider / System Name *","Sağlayıcı / Sistem Adı *")}<input placeholder="e.g. Polaris POS, Foodics, CustomPOS" value={draft.providerName} onChange={(e) => setDraft({ ...draft, providerName: e.target.value })} /></label>
            <label>{t("Integration Method","Entegrasyon Yöntemi")}<select value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value as ConnectionMethod })}><option>REST API</option><option>Webhook</option><option>SFTP / CSV</option><option>Database Read-only</option><option>Other</option></select></label>
            <label>{t("Authentication","Kimlik Doğrulama")}<select value={draft.auth} onChange={(e) => setDraft({ ...draft, auth: e.target.value as AuthMethod })}><option>API Key</option><option>Bearer Token</option><option>OAuth 2.0</option><option>Basic Auth</option><option>Other</option></select></label>
            <label>{t("API / Documentation URL","API / Dokümantasyon URL")}<input placeholder="https://docs.vendor.com/api" value={draft.docsUrl} onChange={(e) => setDraft({ ...draft, docsUrl: e.target.value })} /></label>
            <label>API Base URL<input placeholder="https://api.vendor.com/v1" value={draft.baseUrl} onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })} /></label>
            <label>{t("Account / Outlet / Tenant ID","Hesap / Şube / Tenant ID")}<input placeholder={t("Restaurant or outlet identifier","Restoran veya şube kimliği")} value={draft.accountId} onChange={(e) => setDraft({ ...draft, accountId: e.target.value })} /></label>
          </div>

          <div className="connector-capabilities">
            <strong>{t("What should COSTERA pull?","COSTERA hangi verileri çekmeli?")}</strong>
            <div>{CAPABILITIES.map((capability) => <label key={capability}><input type="checkbox" checked={draft.capabilities.includes(capability)} onChange={() => toggleCapability(capability)} /><span>{capLabel(capability)}</span></label>)}</div>
          </div>

          <label className="connector-notes">{t("Vendor notes / technical response","Firma notları / teknik cevap")}<textarea placeholder={t("Paste endpoint names, vendor instructions, rate limits, webhook notes, etc.","Endpoint adlarını, firma talimatlarını, rate limitleri, webhook notlarını vb. buraya yapıştır.")} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></label>

          <div className="connector-builder-actions">
            <button className="primary" type="button" onClick={saveDraft}>{t("Save Connector Request","Connector Talebini Kaydet")}</button>
            <span>{t("This does not mark the system as connected. It creates the adapter brief we need to build the real connector.","Bu işlem sistemi bağlı olarak işaretlemez. Gerçek connector'ı geliştirmek için gereken adapter brief'ini oluşturur.")}</span>
          </div>
        </section>
      )}

      {savedDrafts.length > 0 && (
        <section className="connector-request-list">
          <div className="connector-request-head">
            <div><span>{t("CONNECTOR REQUESTS","CONNECTOR TALEPLERİ")}</span><h2>{t("Systems waiting for an adapter","Adapter bekleyen sistemler")}</h2></div>
            <small>{savedDrafts.length} {t(savedDrafts.length === 1 ? "request" : "requests","talep")}</small>
          </div>

          <div className="connector-request-grid">
            {savedDrafts.map((item) => (
              <article key={item.id}>
                <div className="connector-request-badge">{item.type === "POS" ? "POS" : item.type === "Delivery" ? "DL" : "ERP"}</div>
                <div><span>{t("NEEDS ADAPTER","ADAPTER GEREKİYOR")}</span><h3>{item.providerName}</h3><p>{item.method} · {item.auth}</p><small>{item.capabilities.slice(0, 3).map(capLabel).join(" · ")}</small></div>
                <div className="connector-request-actions"><button type="button" onClick={() => downloadDraft(item)}>{t("Download brief","Brief'i indir")}</button><button type="button" onClick={() => removeDraft(item.id)}>{t("Remove","Kaldır")}</button></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {status.connected && status.preview && (
        <section className="integration-live-preview">
          <div className="integration-live-head">
            <div><span>{t("LIVE DEMO FEED","CANLI DEMO AKIŞI")}</span><h2>Universal POS → COSTERA</h2><p>{t("Last sync","Son senkron")}: {new Date(status.preview.syncedAt).toLocaleString(tr ? "tr-TR" : "en-US")}</p></div>
            <div className="integration-live-dot"><i /> {t("Receiving data","Veri alınıyor")}</div>
          </div>

          <div className="integration-live-metrics">
            <article><span>{t("Sales rows","Satış satırları")}</span><strong>{status.preview.records.sales}</strong></article>
            <article><span>{t("Menu items","Menü ürünleri")}</span><strong>{status.preview.records.menuItems}</strong></article>
            <article><span>{t("Ingredients","Malzemeler")}</span><strong>{status.preview.records.ingredients}</strong></article>
            <article><span>{t("Inventory rows","Stok satırları")}</span><strong>{status.preview.records.inventoryRows}</strong></article>
          </div>

          <div className="integration-live-flow">
            <div><b>{t("Any POS","Herhangi bir POS")}</b><small>{t("Provider-specific format","Sağlayıcıya özel format")}</small></div><i>→</i>
            <div><b>COSTERA Adapter</b><small>{t("Normalize fields","Alanları normalize et")}</small></div><i>→</i>
            <div><b>{t("Cost Engine","Maliyet Motoru")}</b><small>{t("Expected vs actual","Beklenen vs gerçek")}</small></div><i>→</i>
            <div className="active"><b>Dashboard</b><small>{t("Management result","Yönetim sonucu")}</small></div>
          </div>

          <div className="integration-live-bottom">
            <div><span>{t("Net Sales","Net Satış")}</span><strong>{"$"}{status.preview.totals.netSales.toLocaleString()}</strong></div>
            <div><span>{t("Actual Food Cost","Gerçek Food Cost")}</span><strong>{status.preview.totals.actualFoodCostPct}%</strong></div>
            <div><span>{t("Unexplained Cost","Açıklanamayan Maliyet")}</span><strong>{"$"}{status.preview.totals.unexplainedCost.toLocaleString()}</strong></div>
            <div className="integration-live-links"><Link href="/dashboard">{t("Open Overview","Genel Bakışı Aç")}</Link><Link href="/dashboard/variance">{t("Open Cost Control","Maliyet Kontrolünü Aç")}</Link></div>
          </div>
        </section>
      )}

      <section className="integration-support-guide">
        <div>?</div>
        <div>
          <h3>{t("When a restaurant tells you its POS name","Restoran sana POS adını söylediğinde")}</h3>
          <p>{t("Add it above as a POS connector request. Ask the POS company for API documentation, read-only credentials, authentication method, base URL, outlet/tenant ID, webhook support and rate limits. Put the response into the connector brief and send it to COSTERA development. Only that provider adapter changes; the dashboard and cost engine stay the same.","Yukarıdan POS connector talebi olarak ekle. POS firmasından API dokümanı, read-only yetki, authentication yöntemi, base URL, outlet/tenant ID, webhook desteği ve rate limit bilgilerini iste. Gelen cevabı connector brief'e ekleyip COSTERA geliştirme tarafına gönder. Sadece o sağlayıcının adapter'ı değişir; dashboard ve maliyet motoru aynı kalır.")}</p>
        </div>
      </section>
    </div>
  );
}
