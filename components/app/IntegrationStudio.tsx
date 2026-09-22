"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Preview = {
  provider: string;
  mode: string;
  syncedAt: string;
  records: {
    sales: number;
    menuItems: number;
    ingredients: number;
    inventoryRows: number;
  };
  totals: {
    netSales: number;
    actualFoodCostPct: number;
    unexplainedCost: number;
  };
};

type Status = {
  connected: boolean;
  preview?: Preview;
};

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

export function IntegrationStudio() {
  const [status, setStatus] = useState<Status>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [savedDrafts, setSavedDrafts] = useState<ConnectorDraft[]>([]);
  const [coverage, setCoverage] = useState({
    orders: false,
    fees: false,
    settlements: false,
  });

  useEffect(() => {
    const raw = window.localStorage.getItem("costera_connector_drafts");
    if (raw) {
      try {
        setSavedDrafts(JSON.parse(raw));
      } catch {
        setSavedDrafts([]);
      }
    }
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/pos-demo", { cache: "no-store" });
      const payload = await response.json();
      setStatus({ connected: Boolean(payload.connected), preview: payload.preview });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

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

      if (name === "connect") setMessage("Universal POS Demo connected. Overview and Cost Control are now populated through the same adapter pattern used by real connectors.");
      if (name === "sync") setMessage("Demo source synced successfully.");
      if (name === "disconnect") setMessage("Demo source disconnected. Live-data dashboards are empty again.");
      if (name === "reset") setMessage("Workspace connection reset.");
    } catch {
      setMessage("Connection action failed.");
    } finally {
      setLoading(false);
    }
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
      setMessage("Enter the provider/system name first.");
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
      connector.providerName +
        " saved as a connector request. It is NOT connected yet. Send COSTERA the API documentation or vendor response and an adapter can be added without changing the calculation engine."
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
        title: "Separate delivery connector probably not required.",
        text: "Your POS appears to provide delivery orders, platform fees and settlement data. COSTERA can use the POS as the single source.",
      };
    }

    if (coverage.orders && (!coverage.fees || !coverage.settlements)) {
      return {
        tone: "warning",
        title: "Use POS for orders; connect delivery only for the missing financial data.",
        text: "This avoids duplicate order feeds while still bringing commissions, fees or payouts into COSTERA.",
      };
    }

    return {
      tone: "neutral",
      title: "Delivery connector may be required.",
      text: "If the POS does not expose delivery orders or financial deductions, add the delivery platform or aggregator as another source.",
    };
  }, [coverage]);

  return (
    <div className="integration-studio-v3">
      <section className="integration-architecture">
        <div>
          <span>UNIVERSAL CONNECTOR ARCHITECTURE</span>
          <h2>Any POS. Any delivery platform. One COSTERA model.</h2>
          <p>
            COSTERA is not tied to Polaris, Talabat, Deliveroo or any other vendor. A provider adapter only converts that vendor&apos;s data into COSTERA&apos;s standard sales, recipe, inventory, purchasing and settlement model.
          </p>
        </div>
        <div className="integration-architecture-flow">
          <div><b>Any source</b><small>POS · Delivery · ERP</small></div>
          <i>→</i>
          <div><b>Provider adapter</b><small>API · Webhook · SFTP</small></div>
          <i>→</i>
          <div><b>COSTERA model</b><small>Normalized data</small></div>
          <i>→</i>
          <div className="active"><b>Cost Control</b><small>Same engine every time</small></div>
        </div>
      </section>

      <section className="integration-source-types">
        <article>
          <div className="integration-source-icon">POS</div>
          <div>
            <span>PRIMARY SOURCE</span>
            <h3>Add any POS system</h3>
            <p>Polaris, Foodics, Oracle, Toast, Lightspeed or any other vendor.</p>
          </div>
          <button type="button" onClick={() => openBuilder("POS")}>+ Add POS</button>
        </article>

        <article>
          <div className="integration-source-icon">DL</div>
          <div>
            <span>OPTIONAL SOURCE</span>
            <h3>Add any delivery platform</h3>
            <p>Only needed when your POS does not already provide the required delivery data.</p>
          </div>
          <button type="button" onClick={() => openBuilder("Delivery")}>+ Add Delivery</button>
        </article>

        <article>
          <div className="integration-source-icon">ERP</div>
          <div>
            <span>OPTIONAL SOURCE</span>
            <h3>Accounting / ERP</h3>
            <p>Add expenses, purchasing or accounting data from any back-office system.</p>
          </div>
          <button type="button" onClick={() => openBuilder("Accounting / ERP")}>+ Add ERP</button>
        </article>
      </section>

      <section className="integration-demo-card">
        <div>
          <span>SAFE TEST CONNECTOR</span>
          <h2>Universal POS Demo</h2>
          <p>
            Test the full integration path without pretending a real vendor is connected. This demo uses the same normalize → calculate → dashboard flow.
          </p>
        </div>
        <div className="integration-demo-actions">
          {!status.connected ? (
            <button className="primary" type="button" onClick={() => demoAction("connect")} disabled={loading}>
              Start Demo Feed
            </button>
          ) : (
            <>
              <button className="primary" type="button" onClick={() => demoAction("sync")} disabled={loading}>Sync now</button>
              <button type="button" onClick={() => demoAction("disconnect")} disabled={loading}>Disconnect</button>
            </>
          )}
          <button type="button" onClick={() => demoAction("reset")} disabled={loading}>Reset</button>
        </div>
      </section>

      {message && <div className="integration-message">{message}</div>}

      <section className="integration-delivery-check">
        <div className="integration-delivery-head">
          <div>
            <span>DELIVERY DECISION</span>
            <h2>Check the POS before adding delivery connectors.</h2>
            <p>If the POS already gives COSTERA these fields, we should not duplicate the feed.</p>
          </div>
        </div>

        <div className="integration-coverage-grid">
          <label>
            <input type="checkbox" checked={coverage.orders} onChange={(e) => setCoverage({ ...coverage, orders: e.target.checked })} />
            <span><b>Delivery orders & channels</b><small>Orders identified by platform/channel</small></span>
          </label>
          <label>
            <input type="checkbox" checked={coverage.fees} onChange={(e) => setCoverage({ ...coverage, fees: e.target.checked })} />
            <span><b>Platform fees / commission</b><small>Commission and deductions per platform</small></span>
          </label>
          <label>
            <input type="checkbox" checked={coverage.settlements} onChange={(e) => setCoverage({ ...coverage, settlements: e.target.checked })} />
            <span><b>Settlements / payouts</b><small>What the platform actually paid</small></span>
          </label>
        </div>

        <div className={"integration-delivery-verdict " + deliveryVerdict.tone}>
          <b>{deliveryVerdict.title}</b>
          <span>{deliveryVerdict.text}</span>
        </div>
      </section>

      {builderOpen && (
        <section className="connector-builder">
          <div className="connector-builder-head">
            <div>
              <span>NEW CONNECTOR REQUEST</span>
              <h2>{draft.type}</h2>
              <p>Enter whatever the vendor gives you. Missing fields can stay empty until their technical team responds.</p>
            </div>
            <button type="button" onClick={() => setBuilderOpen(false)}>Close</button>
          </div>

          <div className="connector-builder-grid">
            <label>
              Provider / System Name *
              <input
                placeholder="e.g. Polaris POS, Foodics, CustomPOS"
                value={draft.providerName}
                onChange={(e) => setDraft({ ...draft, providerName: e.target.value })}
              />
            </label>

            <label>
              Integration Method
              <select value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value as ConnectionMethod })}>
                <option>REST API</option>
                <option>Webhook</option>
                <option>SFTP / CSV</option>
                <option>Database Read-only</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Authentication
              <select value={draft.auth} onChange={(e) => setDraft({ ...draft, auth: e.target.value as AuthMethod })}>
                <option>API Key</option>
                <option>Bearer Token</option>
                <option>OAuth 2.0</option>
                <option>Basic Auth</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              API / Documentation URL
              <input
                placeholder="https://docs.vendor.com/api"
                value={draft.docsUrl}
                onChange={(e) => setDraft({ ...draft, docsUrl: e.target.value })}
              />
            </label>

            <label>
              API Base URL
              <input
                placeholder="https://api.vendor.com/v1"
                value={draft.baseUrl}
                onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
              />
            </label>

            <label>
              Account / Outlet / Tenant ID
              <input
                placeholder="Restaurant or outlet identifier"
                value={draft.accountId}
                onChange={(e) => setDraft({ ...draft, accountId: e.target.value })}
              />
            </label>
          </div>

          <div className="connector-capabilities">
            <strong>What should COSTERA pull?</strong>
            <div>
              {CAPABILITIES.map((capability) => (
                <label key={capability}>
                  <input
                    type="checkbox"
                    checked={draft.capabilities.includes(capability)}
                    onChange={() => toggleCapability(capability)}
                  />
                  <span>{capability}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="connector-notes">
            Vendor notes / technical response
            <textarea
              placeholder="Paste endpoint names, vendor instructions, rate limits, webhook notes, etc."
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </label>

          <div className="connector-builder-actions">
            <button className="primary" type="button" onClick={saveDraft}>Save Connector Request</button>
            <span>This does not mark the system as connected. It creates the adapter brief we need to build the real connector.</span>
          </div>
        </section>
      )}

      {savedDrafts.length > 0 && (
        <section className="connector-request-list">
          <div className="connector-request-head">
            <div>
              <span>CONNECTOR REQUESTS</span>
              <h2>Systems waiting for an adapter</h2>
            </div>
            <small>{savedDrafts.length} request{savedDrafts.length === 1 ? "" : "s"}</small>
          </div>

          <div className="connector-request-grid">
            {savedDrafts.map((item) => (
              <article key={item.id}>
                <div className="connector-request-badge">{item.type === "POS" ? "POS" : item.type === "Delivery" ? "DL" : "ERP"}</div>
                <div>
                  <span>NEEDS ADAPTER</span>
                  <h3>{item.providerName}</h3>
                  <p>{item.method} · {item.auth}</p>
                  <small>{item.capabilities.slice(0, 3).join(" · ")}</small>
                </div>
                <div className="connector-request-actions">
                  <button type="button" onClick={() => downloadDraft(item)}>Download brief</button>
                  <button type="button" onClick={() => removeDraft(item.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {status.connected && status.preview && (
        <section className="integration-live-preview">
          <div className="integration-live-head">
            <div>
              <span>LIVE DEMO FEED</span>
              <h2>Universal POS → COSTERA</h2>
              <p>Last sync: {new Date(status.preview.syncedAt).toLocaleString()}</p>
            </div>
            <div className="integration-live-dot"><i /> Receiving data</div>
          </div>

          <div className="integration-live-metrics">
            <article><span>Sales rows</span><strong>{status.preview.records.sales}</strong></article>
            <article><span>Menu items</span><strong>{status.preview.records.menuItems}</strong></article>
            <article><span>Ingredients</span><strong>{status.preview.records.ingredients}</strong></article>
            <article><span>Inventory rows</span><strong>{status.preview.records.inventoryRows}</strong></article>
          </div>

          <div className="integration-live-flow">
            <div><b>Any POS</b><small>Provider-specific format</small></div>
            <i>→</i>
            <div><b>COSTERA Adapter</b><small>Normalize fields</small></div>
            <i>→</i>
            <div><b>Cost Engine</b><small>Expected vs actual</small></div>
            <i>→</i>
            <div className="active"><b>Dashboard</b><small>Management result</small></div>
          </div>

          <div className="integration-live-bottom">
            <div><span>Net Sales</span><strong>{"$"}{status.preview.totals.netSales.toLocaleString()}</strong></div>
            <div><span>Actual Food Cost</span><strong>{status.preview.totals.actualFoodCostPct}%</strong></div>
            <div><span>Unexplained Cost</span><strong>{"$"}{status.preview.totals.unexplainedCost.toLocaleString()}</strong></div>
            <div className="integration-live-links">
              <Link href="/dashboard">Open Overview</Link>
              <Link href="/dashboard/variance">Open Cost Control</Link>
            </div>
          </div>
        </section>
      )}

      <section className="integration-support-guide">
        <div>?</div>
        <div>
          <h3>When a restaurant tells you its POS name</h3>
          <p>
            Add it above as a POS connector request. Ask the POS company for <b>API documentation, read-only credentials, authentication method, base URL, outlet/tenant ID, webhook support and rate limits</b>. Put the response into the connector brief and send it to COSTERA development. Only that provider adapter changes; the dashboard and cost engine stay the same.
          </p>
        </div>
      </section>
    </div>
  );
}
