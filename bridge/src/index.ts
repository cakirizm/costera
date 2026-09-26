import { ServerClient, type JobResult, type PrintJob } from "./client.js";
import { loadConfig } from "./config.js";
import {
  DRAWER_KICK,
  renderKitchenTicket,
  renderPreview,
  renderReceipt,
  type KitchenPayload,
  type ReceiptPayload,
} from "./escpos.js";
import { createTransport, type Transport } from "./transports.js";

/**
 * COSTERA POS print bridge.
 *
 * Runs on the till PC and does one thing: drain the server's print queue onto
 * the hardware. It never holds business state — if it dies mid-service, the
 * jobs stay queued and print when it comes back.
 */

const config = loadConfig();
const client = new ServerClient(config);
const transport = createTransport(config);

const log = (message: string) => {
  process.stdout.write(`[${new Date().toISOString()}] ${message}\n`);
};

async function runJob(job: PrintJob): Promise<void> {
  const preview = renderPreview(job.kind, job.payload, config.columns);

  if (job.kind === "RECEIPT") {
    const payload = job.payload as ReceiptPayload;
    await transport.send(renderReceipt(payload, config.columns), preview);
    if (config.openDrawerOnReceipt) {
      await transport.send(DRAWER_KICK, "[drawer]");
    }
    return;
  }

  if (job.kind === "KITCHEN") {
    const payload = job.payload as KitchenPayload;
    await transport.send(renderKitchenTicket(payload, config.columns), preview);
    return;
  }

  // An unknown kind is a server that is ahead of this bridge. Failing it loudly
  // is better than silently swallowing a ticket.
  throw new Error(`Unsupported job kind: ${job.kind}`);
}

async function drain(): Promise<number> {
  const { jobs } = await client.claim();
  if (jobs.length === 0) return 0;

  const results: JobResult[] = [];
  for (const job of jobs) {
    try {
      await runJob(job);
      results.push({ id: job.id, ok: true });
      log(`printed ${job.kind} ${job.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ id: job.id, ok: false, error: message });
      log(`FAILED ${job.kind} ${job.id}: ${message}`);
    }
  }

  await client.settle(results);
  return jobs.length;
}

let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    log("shutting down");
    stopping = true;
  });
}

async function main(): Promise<void> {
  log(`bridge starting - server ${config.serverUrl}, printer ${transport.name}`);

  // Fail fast on a bad token rather than looping quietly forever.
  const hello = await client.claim(1);
  log(`authenticated as device "${hello.device}"`);
  if (hello.jobs.length > 0) {
    const results: JobResult[] = [];
    for (const job of hello.jobs) {
      try {
        await runJob(job);
        results.push({ id: job.id, ok: true });
      } catch (error) {
        results.push({ id: job.id, ok: false, error: String(error) });
      }
    }
    await client.settle(results);
  }

  let backoffMs = config.pollMs;
  while (!stopping) {
    try {
      const printed = await drain();
      // Busy queues are drained back to back; an idle one is polled gently.
      backoffMs = printed > 0 ? 0 : config.pollMs;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`poll error: ${message}`);
      // Exponential backoff so a server outage does not turn into a request storm.
      backoffMs = Math.min(backoffMs === 0 ? config.pollMs : backoffMs * 2, 60_000);
    }
    if (backoffMs > 0) await new Promise((resolve) => setTimeout(resolve, backoffMs));
  }
}

main().catch((error) => {
  log(`fatal: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
