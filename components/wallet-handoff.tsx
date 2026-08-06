"use client";

import { currentUrl, isIos, phantomBrowseUrl } from "@/components/wallet-env";
import { useT } from "@/components/locale-provider";

/**
 * Shown when someone on a phone tries to do something that needs a wallet.
 *
 * We do NOT redirect silently: leaving for another app should be a choice,
 * and iOS only honours a universal link that came from a real tap anyway.
 * The link carries the current page, so they land on the same dare inside
 * Phantom and can finish there.
 */
export function WalletHandoff({ onClose }: { onClose: () => void }) {
  const t = useT();
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
            <p className="eyebrow">{t.wallet.handoffEyebrow}</p>
            <h2 className="h3" style={{ marginTop: 7 }}>{t.wallet.handoffTitle}</h2>
          </div>
          <button className="modal-x" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        {/* One string: JSX drops the space around an expression sitting at a
            line boundary, which produced "Your browsercan't". */}
        <p style={{ margin: "18px 0 14px", fontSize: 15, lineHeight: 1.5 }}>
          {t.wallet.handoffBody(ios ? t.wallet.safariIphone : t.wallet.yourBrowser)}
        </p>

        <a
          className="btn btn-primary btn-block"
          href={phantomBrowseUrl(target)}
          rel="noopener noreferrer"
        >
          <span>{t.wallet.openInPhantom}</span><span className="arrow">→</span>
        </a>

        <p className="hint" style={{ marginTop: 14 }}>
          {t.wallet.landHere}
        </p>

        <div className="notice notice-cool" style={{ marginTop: 16 }}>
          <b>{t.wallet.otherWallet}</b> {t.wallet.otherWalletBody}{" "}
          <span className="mono" style={{ overflowWrap: "anywhere" }}>
            {target.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    </div>
  );
}
