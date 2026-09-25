"use client";

import { useEffect } from "react";

/**
 * Registers the terminal service worker.
 *
 * Only mounted inside /pos: the marketing site and the dashboard have no reason
 * to install one, and a service worker scoped to the whole origin would start
 * intercepting requests they do not expect.
 */
export function ServiceWorkerBridge() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Registration during development churns on every rebuild and hides real
    // errors behind a stale worker.
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/pos" }).catch(() => {
        // A blocked or unsupported worker just means no offline fallback; the
        // terminal still works online, so this is not worth shouting about.
      });
    };

    if (document.readyState === "complete") {
      const handle = setTimeout(register, 0);
      return () => clearTimeout(handle);
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
