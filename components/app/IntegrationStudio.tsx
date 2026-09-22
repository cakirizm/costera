"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  channels: Array<{ channel: string; orders: number; qty: number; sales: number }>;
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

const providers = [
  { name: "Polaris POS", code: "PO", note: "Sales, menu, recipes, inventory, purchasing" },
  { name: "Talabat", code: "TA", note: "Orders, fees and settlements" },
  { name: "Deliveroo", code: "DE", note: "Orders, fees and settlements" },
  { name: "Careem", code: "CA", note: "Orders, fees and settlements" },
  { name: "Accounting", code: "AC", note: "Operating expenses and P&L" },
];

export function IntegrationStudio() {
  const [status, setStatus] = useState<Status>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [outletId, setOutletId] = useState("");
  const [realModeOpen, setRealModeOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/polaris-demo", { cache: "no-store" });
      const payload = await response.json();
      setStatus({ connected: Boolean(payload.connected), preview: payload.preview });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const action = async (name: "connect" | "sync" | "disconnect" | "reset") => {
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/polaris-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: name }),
      });
      const payload = await response.json();
      setStatus({ connected: Boolean(payload.connected), preview: payload.preview });

      if (name === "connect") setMessage("Polaris demo feed connected. Overview and Cost Control now use the demo source.");
      if (name === "sync") setMessage("Demo feed synced successfully.");
      if (name === "disconnect") setMessage("Polaris demo disconnected. Live-data dashboards are empty again.");
      if (name === "reset") setMessage("Workspace integrations reset.");
    } catch {
      setMessage("Connection action failed.");
    } finally {
      setLoading(false);
    }
  };

  const explainRealTest = () => {
    if (!baseUrl || !apiKey || !outletId) {
      setMessage("For a real Polaris connection you need the API base URL, read-only API key/token and outlet ID supplied by Polaris.");
      return;
    }

    setMessage(
      "Credentials are filled, but COSTERA will not send them anywhere until the Polaris API documentation defines the authentication header and endpoint paths. Once Polaris provides those details, this same form becomes the real Test Connection step."
    );
  };

  return (
    <div className="integration-studio-v2">
      <section className="integration-reset-banner">
        <div>
          <span>INTEGRATION WORKSPACE</span>
          <h2>{status.connected ? "1 source connected" : "No integrations connected"}</h2>
          <p>
            Nothing is treated as live until you explicitly connect a source. Use the Polaris demo to test the flow safely.
          </p>
        </div>
        <button type="button" onClick={() => action("reset")} disabled={loading}>Reset workspace</button>
      </section>

      <section className="integration-provider-grid">
        {providers.map((provider, index) => {
          const isPolaris = index === 0;
          const connected = isPolaris && status.connected;

          return (
            <article className={"integration-provider-card " + (connected ? "connected" : "")} key={provider.name}>
              <div className="integration-provider-icon">{provider.code}</div>
              <div className="integration-provider-copy">
                <div>
                  <h3>{provider.name}</h3>
                  <span className={connected ? "connected" : "disconnected"}>
                    {connected ? "Connected · Demo" : "Not connected"}
                  </span>
                </div>
                <p>{provider.note}</p>
              </div>

              {isPolaris ? (
                <div className="integration-provider-actions">
                  {!connected ? (
                    <>
                      <button className="primary" type="button" onClick={() => action("connect")} disabled={loading}>
                        Start Demo Feed
                      </button>
                      <button type="button" onClick={() => setRealModeOpen((v) => !v)}>
                        Real Connection
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="primary" type="button" onClick={() => action("sync")} disabled={loading}>
                        Sync now
                      </button>
                      <button type="button" onClick={() => action("disconnect")} disabled={loading}>
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <button className="integration-coming" type="button" disabled>Not configured</button>
              )}
            </article>
          );
        })}
      </section>

      {message && <div className="integration-message">{message}</div>}

      {realModeOpen && (
        <section className="polaris-real-panel">
          <div className="polaris-real-head">
            <div>
              <span>REAL POLARIS CONNECTION</span>
              <h2>What you will enter when Polaris gives API access</h2>
            </div>
            <b>Read-only</b>
          </div>

          <div className="polaris-real-grid">
            <label>
              API Base URL
              <input
                placeholder="https://api.polaris.../"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <small>Provided by Polaris technical support.</small>
            </label>

            <label>
              API Key / Token
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <small>Read-only integration credential.</small>
            </label>

            <label>
              Outlet / Branch ID
              <input
                placeholder="e.g. DXB-001"
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
              />
              <small>The Polaris identifier for the restaurant branch.</small>
            </label>
          </div>

          <div className="polaris-real-flow">
            <div><i>1</i><span>Get API details from Polaris</span></div>
            <em>→</em>
            <div><i>2</i><span>Enter credentials here</span></div>
            <em>→</em>
            <div><i>3</i><span>Test connection</span></div>
            <em>→</em>
            <div><i>4</i><span>Select data modules</span></div>
            <em>→</em>
            <div><i>5</i><span>Start automatic sync</span></div>
          </div>

          <div className="polaris-module-list">
            <span>✓ Sales & order lines</span>
            <span>✓ Menu items</span>
            <span>✓ Recipes / BOM</span>
            <span>✓ Inventory balances</span>
            <span>✓ Purchases / receipts</span>
            <span>✓ Waste & transfers</span>
          </div>

          <button className="polaris-test-button" type="button" onClick={explainRealTest}>
            Test Real Connection
          </button>
        </section>
      )}

      {status.connected && status.preview && (
        <section className="integration-live-preview">
          <div className="integration-live-head">
            <div>
              <span>LIVE DEMO FEED</span>
              <h2>Polaris → COSTERA</h2>
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
            <div><b>Polaris POS</b><small>Demo API source</small></div>
            <i>→</i>
            <div><b>COSTERA Adapter</b><small>Normalize fields</small></div>
            <i>→</i>
            <div><b>Cost Engine</b><small>Expected vs actual</small></div>
            <i>→</i>
            <div className="active"><b>Dashboard</b><small>Live management result</small></div>
          </div>

          <div className="integration-live-bottom">
            <div>
              <span>Net Sales</span>
              <strong>{"$"}{status.preview.totals.netSales.toLocaleString()}</strong>
            </div>
            <div>
              <span>Actual Food Cost</span>
              <strong>{status.preview.totals.actualFoodCostPct}%</strong>
            </div>
            <div>
              <span>Unexplained Cost</span>
              <strong>{"$"}{status.preview.totals.unexplainedCost.toLocaleString()}</strong>
            </div>
            <div className="integration-live-links">
              <Link href="/dashboard">Open Overview</Link>
              <Link href="/dashboard/variance">Open Cost Control</Link>
            </div>
          </div>
        </section>
      )}

      {!status.connected && !loading && (
        <section className="integration-empty-help">
          <div>?</div>
          <section>
            <h3>How do I test this?</h3>
            <p>
              Click <b>Start Demo Feed</b> on Polaris POS. COSTERA will create a temporary demo connection,
              receive a Polaris-shaped dataset, run it through the same adapter and calculation engine, and populate the live dashboards.
              Disconnect or reset to return to zero data.
            </p>
          </section>
        </section>
      )}
    </div>
  );
}
