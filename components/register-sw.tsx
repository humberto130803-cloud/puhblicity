"use client";

import { useEffect } from "react";

/**
 * Registers the service worker, which is what makes the site installable
 * (Chrome requires one with a fetch handler before it offers "Install").
 * See public/sw.js for what it deliberately refuses to cache.
 */
export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // NEVER in development. Production chunk URLs are content-hashed, so a
    // deploy invalidates them; `next dev` serves stable URLs like
    // /_next/static/chunks/app/create/page.js, which the cache-first rule
    // would then pin to the first version it ever saw. Edits appear to do
    // nothing, which is a genuinely maddening way to lose an hour.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((rs) =>
        rs.forEach((r) => r.unregister())
      ).catch(() => {});
      caches?.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
      return;
    }

    // Registration is best-effort: a failure here must never break the site.
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
