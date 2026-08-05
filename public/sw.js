/**
 * PUHBLICITY service worker.
 *
 * The whole point of this file is what it REFUSES to cache. This site shows
 * live money: a pot that climbs, a countdown, a paused flag, a refund state.
 * A service worker that helpfully serves yesterday's copy of a dare page
 * would show someone a stale pot and, worse, could show the site as open
 * while it is paused. So:
 *
 *   · /api/*        never touched. Always straight to the network.
 *   · HTML pages    network-only, with an offline card as the ONLY fallback.
 *                   Never a cached page — no stale money, ever.
 *   · /_next/static immutable, content-hashed by the build. Cache freely.
 *   · icons/manifest cached, they never change meaningfully.
 *
 * Bump VERSION to evict everything on the next visit.
 */
const VERSION = "puhb-v1";
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline";

const PRECACHE = [
  OFFLINE_URL,
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Money endpoints: hands off entirely.
  if (url.pathname.startsWith("/api/")) return;

  // Immutable build output — safe to serve from cache.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
      )
    );
    return;
  }

  // Icons and the manifest.
  if (/\.(png|ico|svg|webmanifest)$/.test(url.pathname) || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
      )
    );
    return;
  }

  // Pages: network only. If the network is gone, show the offline card —
  // never a cached page that might lie about the state of a pot.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(OFFLINE_URL).then((hit) => hit || new Response("Offline", { status: 503 }))
      )
    );
  }
});
