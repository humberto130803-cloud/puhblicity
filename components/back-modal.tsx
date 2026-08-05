"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { payVault } from "@/components/solana-tx";
import { useConnectOrSignIn } from "@/components/use-connect";
import { formatSol, parseSolToLamports } from "@/lib/format";
import type { PublicDare } from "@/lib/dares";

const PRESETS = ["0.05", "0.10", "0.25", "0.50"];
const MIN_PLEDGE = 50_000_000n;

/**
 * The backing modal. Amount, optional public note, a live summary of what
 * this pledge does to the pot — including the "this closes it" moment —
 * then the wallet approval.
 */
export function BackModal({
  dare,
  vault,
  onClose,
  onBacked,
}: {
  dare: PublicDare;
  vault: string;
  onClose: () => void;
  onBacked: (lamports: bigint) => void;
}) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const connectOrSignIn = useConnectOrSignIn();
  const pot = BigInt(dare.pot);
  const target = BigInt(dare.target);
  const toGo = target > pot ? target - pot : 0n;

  const [amount, setAmount] = useState(
    toGo > 0n && toGo <= 250_000_000n && toGo >= MIN_PLEDGE ? formatSol(toGo) : "0.10"
  );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lamports = useMemo(() => parseSolToLamports(amount), [amount]);
  const crosses = lamports !== null && pot + lamports >= target;
  const finishIt = toGo >= MIN_PLEDGE ? formatSol(toGo) : null;

  async function submit() {
    setError(null);
    // A session cookie outlives a wallet connection — and on a phone the
    // wallet may never have been reachable in this browser at all. Route
    // them to the right place instead of failing at signing time.
    if (!wallet.connected || !wallet.publicKey) {
      onClose();
      connectOrSignIn();
      return;
    }
    if (lamports === null) {
      setError("That amount doesn't parse. Plain numbers, like 0.1.");
      return;
    }
    if (lamports < MIN_PLEDGE) {
      setError("Minimum pledge is 0.05 SOL.");
      return;
    }
    setBusy(true);
    try {
      const sig = await payVault(wallet, connection, vault, lamports, `PUHB:${dare.id}`);
      await fetch("/api/pledges/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: sig, note: note.trim() || undefined }),
      }).catch(() => {});
      onBacked(lamports);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something broke. Nothing left your wallet unless it says so."
      );
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Back ${dare.category_label}`}
    >
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <p className="eyebrow">Backing</p>
            <h2 className="h3" style={{ marginTop: 7 }}>{dare.category_label}</h2>
          </div>
          <button className="modal-x" aria-label="Close" onClick={onClose} disabled={busy}>✕</button>
        </div>

        <div className="field" style={{ marginTop: 24 }}>
          <label className="label" htmlFor="amt">How much</label>
          <input
            className="input mono"
            id="amt"
            value={amount}
            inputMode="decimal"
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="amountrow" style={{ marginTop: 4 }}>
            {PRESETS.map((p) => (
              <button key={p} type="button" className="btn btn-sm" onClick={() => setAmount(p)}>
                <span>{p}</span>
              </button>
            ))}
            {finishIt && (
              <button type="button" className="btn btn-sm" onClick={() => setAmount(finishIt)}>
                <span>{finishIt} — finish it</span>
              </button>
            )}
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="note">Say something (optional)</label>
          <input
            className="input"
            id="note"
            placeholder="do it without water"
            maxLength={80}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <span className="counter">{note.length} / 80</span>
        </div>

        <div className="card card-flat" style={{ borderWidth: 1, padding: 15, marginBottom: 18 }}>
          <div className="rowline" style={{ padding: "6px 0" }}>
            <span>Your pledge</span>
            <b className="mono">{lamports !== null ? `${formatSol(lamports)} SOL` : "—"}</b>
          </div>
          <div className="rowline" style={{ padding: "6px 0" }}>
            <span>Network fee</span><span className="mono muted">~0.000005</span>
          </div>
          <div className="rowline" style={{ padding: "6px 0" }}>
            <span>Pot after this</span>
            <b className="mono">
              {lamports !== null
                ? `${formatSol(pot + lamports)} / ${formatSol(target)}${crosses ? " — closes" : ""}`
                : "—"}
            </b>
          </div>
        </div>

        {crosses && (
          <div className="notice notice-cool" style={{ marginBottom: 20 }}>
            This pledge takes the dare past its target, so funding closes the
            moment it lands. {dare.doer_name} gets 48 hours to send proof. If
            proof doesn&apos;t come, or we reject it, you get all{" "}
            {lamports !== null ? formatSol(lamports) : ""} back.
          </div>
        )}

        {error && (
          <div className="notice" role="alert" style={{ marginBottom: 16 }}>{error}</div>
        )}

        <button className="btn btn-primary btn-block" onClick={() => void submit()} disabled={busy}>
          <span>
            {busy
              ? "Waiting on your wallet…"
              : `Back with ${lamports !== null ? formatSol(lamports) : "…"} SOL`}
          </span>
        </button>
        <p className="hint" style={{ marginTop: 11, textAlign: "center" }}>
          Your wallet will ask you to approve. Pledges are final while a dare is open.
        </p>
      </div>
    </div>
  );
}
