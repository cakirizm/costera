import { appendFile } from "node:fs/promises";
import { createConnection } from "node:net";
import type { BridgeConfig } from "./config.js";

/** Where the rendered bytes go. One implementation per way of reaching paper. */
export type Transport = {
  readonly name: string;
  send(bytes: Uint8Array, preview: string): Promise<void>;
};

/** Raw ESC/POS over TCP 9100, which is how every networked thermal printer works. */
function networkTransport(config: BridgeConfig): Transport {
  return {
    name: `network ${config.printerHost}:${config.printerPort}`,
    send(bytes) {
      return new Promise((resolve, reject) => {
        const socket = createConnection({ host: config.printerHost, port: config.printerPort });
        // Without a timeout a printer that is off leaves the job claimed until
        // the OS gives up, which can be minutes.
        socket.setTimeout(8000);
        socket.on("timeout", () => {
          socket.destroy();
          reject(new Error("Printer did not respond within 8s"));
        });
        socket.on("error", reject);
        socket.on("connect", () => {
          socket.write(bytes, (error) => {
            if (error) {
              socket.destroy();
              reject(error);
              return;
            }
            socket.end();
          });
        });
        socket.on("close", resolve);
      });
    },
  };
}

function fileTransport(config: BridgeConfig): Transport {
  return {
    name: `file ${config.printerFile}`,
    async send(bytes) {
      await appendFile(config.printerFile, bytes);
    },
  };
}

function stdoutTransport(): Transport {
  return {
    name: "stdout",
    async send(_bytes, preview) {
      process.stdout.write("\n" + preview + "\n");
    },
  };
}

export function createTransport(config: BridgeConfig): Transport {
  switch (config.transport) {
    case "network":
      return networkTransport(config);
    case "file":
      return fileTransport(config);
    default:
      return stdoutTransport();
  }
}
