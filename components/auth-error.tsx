"use client";

/**
 * Sign-in failures used to be caught, stored, and never rendered anywhere —
 * so a failed sign-in looked exactly like nothing happening. If we ask
 * someone to approve something in their wallet, we owe them the outcome.
 */
export function AuthError({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <div className="auth-error" role="alert">
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>Couldn&apos;t sign you in</b>
        <span>{error}</span>
      </div>
      <button className="install-hint__x" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
