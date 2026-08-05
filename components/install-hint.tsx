"use client";

import { useEffect, useState } from "react";

/**
 * "Put it on your home screen."
 *
 * Two different worlds:
 *  · Chrome/Android fires beforeinstallprompt, so we can install in one tap.
 *  · iOS Safari has no such event — installing is Share → Add to Home
 *    Screen, and the only thing we can do is tell people where to look.
 *
 * Shown once, dismissible, and never while already running standalone.
 */

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "puhb.installhint.dismissed";

export function InstallHint() {
  const [deferred, setDeferred] = useState<PromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {
      /* private mode — just show it */
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS marks installed web apps here rather than via display-mode.
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as PromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS: no install event exists, so detect Safari-on-iOS and explain.
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIos && isSafari) {
      const t = setTimeout(() => setShowIos(true), 3500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
    setDeferred(null);
    setShowIos(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    dismiss();
  }

  if (!deferred && !showIos) return null;

  return (
    <div className="install-hint" role="dialog" aria-label="Install PUHBLICITY">
      <img src="/icon-192.png" alt="" width={44} height={44} className="install-hint__icon" />
      <div className="install-hint__body">
        <b>Put it on your home screen</b>
        <span>
          {deferred
            ? "Full screen, no browser bar. One tap."
            : "Tap Share, then “Add to Home Screen”."}
        </span>
      </div>
      {deferred && (
        <button className="btn btn-sm btn-primary" onClick={() => void install()}>
          <span>Install</span>
        </button>
      )}
      <button className="install-hint__x" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
