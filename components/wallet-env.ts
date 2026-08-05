"use client";

/**
 * Where are we, and can a wallet actually sign here?
 *
 * On a phone there is no browser extension. iOS Safari cannot talk to
 * Phantom at all — the dapp has to be running *inside* Phantom's own
 * in-app browser, which injects a provider the way an extension would.
 * Android is the same story in practice.
 *
 * So the mobile flow is: hand the user off to Phantom's browser, at the
 * exact page they were on, and let them finish there.
 */

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports as a Mac; touch points give it away.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export const isMobile = () => isIos() || isAndroid();

/** Running as an installed home-screen app rather than a browser tab. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Is a wallet provider present in this context? True inside Phantom's or
 * Solflare's in-app browser, and on desktop with an extension installed.
 */
export function hasInjectedWallet(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    phantom?: { solana?: unknown };
    solana?: { isPhantom?: boolean };
    solflare?: unknown;
    backpack?: unknown;
  };
  return !!(w.phantom?.solana || w.solana || w.solflare || w.backpack);
}

/**
 * Deeplink that opens `target` inside Phantom's in-app browser.
 * Format per Phantom's docs: https://phantom.app/ul/browse/<url>?ref=<ref>
 * with BOTH parameters percent-encoded.
 *
 * Must be triggered by a real user gesture — iOS refuses to follow a
 * universal link that a script opens on its own.
 */
export function phantomBrowseUrl(target: string): string {
  const origin = (() => {
    try {
      return new URL(target).origin;
    } catch {
      return target;
    }
  })();
  return `https://phantom.app/ul/browse/${encodeURIComponent(target)}?ref=${encodeURIComponent(origin)}`;
}

/** The current page, as the place Phantom's browser should land. */
export function currentUrl(): string {
  if (typeof window === "undefined") return "https://puhblicity.vercel.app/";
  // localhost is meaningless inside the wallet app; send it to production.
  if (/^(localhost|127\.|192\.168\.)/.test(window.location.hostname)) {
    return `https://puhblicity.vercel.app${window.location.pathname}`;
  }
  return window.location.href;
}
