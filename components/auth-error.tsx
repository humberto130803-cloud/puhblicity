"use client";

/**
 * Sign-in failures used to be caught, stored, and never rendered anywhere —
 * so a failed sign-in looked exactly like nothing happening. If we ask
 * someone to approve something in their wallet, we owe them the outcome.
 */
import { useT } from "@/components/locale-provider";

export function AuthError({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  const t = useT();
  return (
    <div className="auth-error" role="alert">
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>{t.wallet.authErrTitle}</b>
        <span>{error}</span>
      </div>
      <button className="install-hint__x" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
