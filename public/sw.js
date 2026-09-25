/*
 * COSTERA POS service worker.
 *
 * Scope is the terminal only. Two jobs:
 *   1. keep the static build assets available so a reload during a blip does not
 *      leave the waiter on a blank screen;
 *   2. show an honest offline page when a navigation cannot reach the server.
 *
 * It deliberately does NOT cache page HTML or RSC payloads. Ticket state is
 * server-rendered and changes every few seconds, and a stale table plan showing
 * a paid table as occupied is worse than an offline notice.
 */

const VERSION = "costera-pos-v1";
const ASSETS = `${VERSION}-assets`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(ASSETS).then((cache) => cache.addAll([OFFLINE_URL])).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function isBuildAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/brand/");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Never touch anything that changes state. A replayed POST is a double order.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isBuildAsset(url)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(ASSETS);
        return (await cache.match(OFFLINE_URL)) ?? Response.error();
      }),
    );
  }
});
