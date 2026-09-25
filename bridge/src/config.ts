/** Bridge configuration, read once at start-up from the environment. */

export type PrinterTransportKind = "network" | "file" | "stdout";

export type BridgeConfig = {
  serverUrl: string;
  deviceToken: string;
  transport: PrinterTransportKind;
  printerHost: string;
  printerPort: number;
  printerFile: string;
  columns: number;
  openDrawerOnReceipt: boolean;
  pollMs: number;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value === "replace-me") {
    throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

function transportFrom(value: string | undefined): PrinterTransportKind {
  if (value === "network" || value === "file" || value === "stdout") return value;
  throw new Error(`PRINTER_TRANSPORT must be network, file or stdout (got "${value ?? ""}").`);
}

export function loadConfig(env = process.env): BridgeConfig {
  const previous = process.env;
  process.env = env;
  try {
    return {
      serverUrl: required("COSTERA_URL").replace(/\/+$/, ""),
      deviceToken: required("COSTERA_DEVICE_TOKEN"),
      transport: transportFrom(env.PRINTER_TRANSPORT),
      printerHost: env.PRINTER_HOST ?? "127.0.0.1",
      printerPort: Number(env.PRINTER_PORT ?? 9100),
      printerFile: env.PRINTER_FILE ?? "./printer-out.bin",
      columns: Number(env.PRINTER_COLUMNS ?? 42),
      openDrawerOnReceipt: (env.OPEN_DRAWER_ON_RECEIPT ?? "true") !== "false",
      pollMs: Math.max(1, Number(env.POLL_SECONDS ?? 3)) * 1000,
    };
  } finally {
    process.env = previous;
  }
}
