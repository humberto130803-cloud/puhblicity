"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Tote } from "@/components/tote";
import { StatusStamp } from "@/components/status-stamp";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { payVault } from "@/components/solana-tx";
import { ProofPanel } from "@/components/proof-panel";
import { formatSol, parseSolToLamports, remaining, ago } from "@/lib/format";
import type { PublicDare, PublicPledge } from "@/lib/dares";

const PLEDGE_PRESETS = ["0.05", "0.1", "0.25", "0.5"];
const MIN_PLEDGE = 50_000_000n;

export function DareView({
  initialDare,
  initialPledges,
  isOwner,
  flagged,
  paused,
  vault,
}: {
  initialDare: PublicDare;
  initialPledges: PublicPledge[];
  isOwner: boolean;
  flagged: boolean;
  paused: boolean;
  vault: string;
}) {
  const [dare, setDare] = useState(initialDare);
  const [pledges, setPledges] = useState(initialPledges);
  const { session } = useAuth();
  const connect = useConnectOrSignIn();
  const wallet = useWallet();
  const { connection } = useConnection();

  const [amount, setAmount] = useState("0.1");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "warn" | "error"; text: string } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/dares/${initialDare.id}`, { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      setDare(d.dare);
      setPledges(d.pledges);
    } catch {
      /* next poll */
    }
  }, [initialDare.id]);

  const polling = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    polling.current = setInterval(refresh, 6000);
    return () => {
      if (polling.current) clearInterval(polling.current);
    };
  }, [refresh]);

  const pot = BigInt(dare.pot);
  const target = BigInt(dare.target);

  async function back() {
    setMsg(null);
    const lamports = parseSolToLamports(amount);
    if (lamports === null) {
      setMsg({ kind: "error", text: "That amount doesn't parse. Plain numbers, like 0.1." });
      return;
    }
    if (lamports < MIN_PLEDGE) {
      setMsg({ kind: "error", text: "Minimum pledge is 0.05 SOL." });
      return;
    }
    setBusy(true);
    try {
      const sig = await payVault(wallet, connection, vault, lamports, `PUHB:${dare.id}`);
      setMsg({ kind: "warn", text: "Landed on-chain — crediting…" });
      const r = await fetch("/api/pledges/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: sig, note: note.trim() || undefined }),
      });
      const d = await r.json();
      await refresh();
      if (d.credited) {
        setMsg({ kind: "ok", text: `Backed with ${formatSol(lamports)} SOL. Watch the bar.` });
        setNote("");
      } else {
        setMsg({
          kind: "warn",
          text: "Your pledge is on-chain and will credit within a minute. If the dare closed while it was in flight, it goes straight back.",
        });
      }
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Something broke. Nothing charged unless your wallet says so." });
    } finally {
      setBusy(false);
    }
  }

  const canBack = dare.status === "OPEN" && !paused && !flagged;

  return (
    <div className="wrap">
      <div className="detail-board panel panel--field">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span className="eyebrow">
            Dare {dare.id} · {dare.doer_name}
            {dare.doer_instagram ? ` · @${dare.doer_instagram}` : ""}
          </span>
          <StatusStamp status={dare.status} />
        </div>
        <h1 className="display" style={{ fontSize: "clamp(26px, 5vw, 44px)", margin: "12px 0 6px" }}>
          {dare.category_emoji} {dare.category_label}
        </h1>
        {dare.detail && <p style={{ opacity: 0.92, marginBottom: 8 }}>{dare.detail}</p>}
        <p className="eyebrow" style={{ marginBottom: 18 }}>
          Proof means: {dare.category_blurb}
        </p>
        <Tote pot={pot} target={target} size="lg" onField />
        <p className="mono" style={{ marginTop: 14, fontSize: 13, opacity: 0.85 }}>
          {dare.backer_count} backer{dare.backer_count === 1 ? "" : "s"}
          {dare.status === "OPEN" && <> · {remaining(dare.funding_ends_at)} to fill it</>}
          {dare.status === "CLOSED" && dare.proof_due_at && (
            <> · proof due in {remaining(dare.proof_due_at)}</>
          )}
        </p>
      </div>

      {flagged && (
        <div className="notice notice--warn" style={{ marginTop: 14 }}>
          This dare is waiting for a quick human check before it goes on the
          board. Only you can see it right now.
        </div>
      )}

      {/* ---------- state copy ---------- */}
      {dare.status === "REFUNDING" && (
        <div className="notice" style={{ marginTop: 14 }}>
          This one didn&apos;t make it. Every backer gets every lamport back,
          automatically — usually within a minute or two.
        </div>
      )}
      {dare.status === "REFUNDED" && (
        <div className="notice" style={{ marginTop: 14 }}>
          Settled: every backer was refunded in full.
          {dare.reject_reason ? ` Reason: ${dare.reject_reason}` : ""}
        </div>
      )}
      {dare.status === "KILLED" && (
        <div className="notice" style={{ marginTop: 14 }}>
          This dare was removed. Every backer gets every lamport back, automatically.
        </div>
      )}
      {dare.status === "PAID" && (
        <div className="notice notice--ok" style={{ marginTop: 14 }}>
          Done and paid.{" "}
          {dare.payout_signature && (
            <a
              href={`https://solscan.io/tx/${dare.payout_signature}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Payout on-chain ↗
            </a>
          )}
        </div>
      )}

      {/* ---------- proof video (paid = public; owner/admin always) ---------- */}
      {dare.has_proof && (dare.status === "PAID" || isOwner) && (
        <ProofVideo dareId={dare.id} />
      )}

      {/* ---------- owner: proof upload ---------- */}
      {isOwner && (dare.status === "CLOSED" || dare.status === "IN_REVIEW") && (
        <ProofPanel dare={dare} onDone={refresh} />
      )}
      {isOwner && dare.status === "IN_REVIEW" && dare.reject_reason && (
        <div className="notice notice--error" style={{ marginTop: 14 }}>
          Previous proof was rejected: {dare.reject_reason}
        </div>
      )}

      {/* ---------- back form ---------- */}
      {canBack && (
        <section className="panel" style={{ padding: 20, marginTop: 22 }} aria-label="Back this dare">
          <p className="eyebrow">Fill the pot</p>
          <div className="choice-row" style={{ margin: "10px 0" }}>
            {PLEDGE_PRESETS.map((p) => (
              <button
                key={p}
                className="choice mono"
                aria-pressed={amount === p}
                onClick={() => setAmount(p)}
              >
                {p} SOL
              </button>
            ))}
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Pledge amount in SOL"
              style={{ width: 110 }}
            />
          </div>
          <input
            type="text"
            placeholder="Say something (optional, 80 chars, public)"
            maxLength={80}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-label="Public note"
            style={{ marginBottom: 10 }}
          />
          {session ? (
            <button className="btn btn--flare" onClick={() => void back()} disabled={busy}>
              {busy ? "Sending…" : "Back this dare"}
            </button>
          ) : (
            <button className="btn btn--flare" onClick={connect}>
              Connect to back this dare
            </button>
          )}
          <p className="field-help" style={{ marginTop: 10 }}>
            Pledges are final while the dare is open — but if the dare misses
            its target or the proof never comes, you get 100% back,
            automatically. Pledge from your own wallet: sends from an exchange
            lose the tag and we can&apos;t match them. If this closes while your
            transaction is in flight, we send it straight back.
          </p>
          {msg && (
            <div
              className={`notice notice--${msg.kind === "ok" ? "ok" : msg.kind === "warn" ? "warn" : "error"}`}
              role="status"
              style={{ marginTop: 10 }}
            >
              {msg.text}
            </div>
          )}
        </section>
      )}

      {/* ---------- backers ---------- */}
      <section style={{ marginTop: 26 }} aria-label="Backers">
        <p className="eyebrow">On the board</p>
        {pledges.length === 0 ? (
          <p style={{ color: "var(--slate)", marginTop: 8 }}>
            Nobody yet. First name on the wall gets remembered.
          </p>
        ) : (
          <ul className="pledge-list">
            {pledges.map((p) => (
              <li key={p.signature}>
                <span>
                  <span className="mono">{p.backer}</span>
                  {p.note && <span style={{ color: "var(--slate)" }}> — {p.note}</span>}
                </span>
                <span className="mono">
                  {formatSol(BigInt(p.lamports))} SOL · {ago(p.at)}
                  {p.refund_status === "SENT" && " · refunded"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProofVideo({ dareId }: { dareId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/proof/view?dare=${dareId}`)
      .then((r) => r.json())
      .then((d) => (d.url ? setUrl(d.url) : setError(d.error)))
      .catch(() => setError("Could not load the proof"));
  }, [dareId]);
  if (error) return null;
  return (
    <section className="panel" style={{ padding: 12, marginTop: 18 }} aria-label="Proof">
      <p className="eyebrow" style={{ marginBottom: 8 }}>The proof</p>
      {url ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={url} controls playsInline style={{ width: "100%", border: "2px solid var(--ink)" }} />
      ) : (
        <p style={{ color: "var(--slate)" }}>Loading…</p>
      )}
    </section>
  );
}
