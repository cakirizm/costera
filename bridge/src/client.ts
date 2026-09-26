import type { BridgeConfig } from "./config.js";

export type PrintJob = { id: string; kind: string; payload: unknown; attempts: number };
export type JobResult = { id: string; ok: boolean; error?: string | null };

/** Thin client over the two bridge endpoints. */
export class ServerClient {
  constructor(private readonly config: BridgeConfig) {}

  private get headers() {
    return {
      authorization: `Bearer ${this.config.deviceToken}`,
      "content-type": "application/json",
    };
  }

  private get endpoint() {
    return `${this.config.serverUrl}/api/pos/bridge/jobs`;
  }

  async claim(limit = 5): Promise<{ device: string; jobs: PrintJob[] }> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ limit }),
    });
    if (response.status === 401) {
      throw new Error("Device token rejected. Re-enrol the bridge in Integrations.");
    }
    if (!response.ok) throw new Error(`Claim failed with HTTP ${response.status}`);

    const body = (await response.json()) as { device: string; jobs: PrintJob[] };
    return { device: body.device, jobs: body.jobs ?? [] };
  }

  async settle(results: readonly JobResult[]): Promise<void> {
    if (results.length === 0) return;
    const response = await fetch(this.endpoint, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify({ results }),
    });
    if (!response.ok) throw new Error(`Settle failed with HTTP ${response.status}`);
  }
}
