"use client";

import { currentUrl, isIos, phantomBrowseUrl } from "@/components/wallet-env";

/**
 * Shown when someone on a phone tries to do something that needs a wallet.
 *
 * We do NOT redirect silently: leaving for another app should be a choice,
 * and iOS only honours a universal link that came from a real tap anyway.
 * The link carries the current page, so they land on the same dare inside
 * Phantom and can finish there.
 */
export function WalletHandoff({ onClose }: { onClose: () => void }) {
  const target = currentUrl();
  const ios = isIos();

  return (
    <div
      className="modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Open in a wallet browser"
    >
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <p className="eyebrow">One step</p>
            <h2 className="h3" style={{ marginTop: 7 }}>Open this in your wallet</h2>
          </div>
          <button className="modal-x" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        {/* One string: JSX drops the space around an expression sitting at a
            line boundary, which produced "Your browsercan't". */}
        <p style={{ margin: "18px 0 14px", fontSize: 15, lineHeight: 1.5 }}>
          {`${ios ? "Safari on iPhone" : "Your browser"} can't talk to a wallet directly — that's a phone limitation, not ours. Phantom has its own browser built in, and everything works normally in there.`}
        </p>

        <a
          className="btn btn-primary btn-block"
          href={phantomBrowseUrl(target)}
          rel="noopener noreferrer"
        >
          <span>Open in Phantom</span><span className="arrow">→</span>
        </a>

        <p className="hint" style={{ marginTop: 14 }}>
          You&apos;ll land on this exact page inside Phantom, wallet ready.
          Don&apos;t have it? Install Phantom, then come back and tap this again.
        </p>

        <div className="notice notice-cool" style={{ marginTop: 16 }}>
          <b>Using a different wallet?</b> Open its in-app browser and paste{" "}
          <span className="mono" style={{ overflowWrap: "anywhere" }}>
            {target.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    </div>
  );
}
