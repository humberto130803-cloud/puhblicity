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
    // Registration is best-effort: a failure here must never break the site.
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
