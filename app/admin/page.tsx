"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { formatSol, remaining, shortWallet, ago } from "@/lib/format";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminPage() {
  const { session, isAdmin } = useAuth();
  const connect = useConnectOrSignIn();
  const [data, setData] = useState<any | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setMsg("Could not load overview"));
  }, []);

  useEffect(() => {
    if (session && isAdmin) load();
  }, [session, isAdmin, load]);

  async function act(body: Record<string, unknown>) {
    setMsg(null);
    const r = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setMsg(r.ok ? "Done." : d.error ?? "Failed");
    load();
  }

  async function watchProof(dareId: string) {
    const r = await fetch(`/api/proof/view?dare=${dareId}`);
    const d = await r.json();
    if (d.url) setProofUrl(d.url);
    else setMsg(d.error ?? "No proof");
  }

  if (!session || !isAdmin) {
    return (
      <div className="wrap" style={{ padding: "40px 16px" }}>
        <div className="panel" style={{ padding: 24, maxWidth: 480 }}>
          <p style={{ marginBottom: 12 }}>Admin only. Sign in with the admin wallet.</p>
          <button className="btn" onClick={connect}>Connect</button>
        </div>
      </div>
    );
  }

  const reviewDeadline = (d: any) =>
    d.proof_submitted_at
      ? remaining(new Date(new Date(d.proof_submitted_at).getTime() + 24 * 3600_000).toISOString())
      : "—";

  return (
    <div className="wrap" style={{ paddingBottom: 60 }}>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <p className="eyebrow">Operator panel</p>
        <h1 className="display" style={{ fontSize: "clamp(28px, 5vw, 46px)" }}>
          The back of the board
        </h1>
      </section>

      {msg && <div className="notice" role="status">{msg}</div>}

      {data && (
        <>
          <section className="admin-section panel" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <span className="mono">
                Vault: {data.vaultBalance === "rpc-error" ? "RPC error" : `${formatSol(BigInt(data.vaultBalance))} SOL`}
              </span>
              <span className="mono">Open pot owed: {formatSol(BigInt(data.openPot))} SOL</span>
              <span className="mono">{shortWallet(data.vaultPubkey)}</span>
              <button
                className={`btn ${data.paused ? "btn--jade" : "btn--flare"}`}
                onClick={() => act({ action: data.paused ? "unpause" : "pause" })}
              >
                {data.paused ? "UNPAUSE the site" : "PAUSE the site"}
              </button>
            </div>
            {BigInt(data.vaultBalance !== "rpc-error" ? data.vaultBalance : 0) <
              BigInt(data.openPot) && (
              <div className="notice notice--error" style={{ marginTop: 10 }}>
                Vault holds less than the open pot. Top it up NOW — refunds
                fail without it.
              </div>
            )}
          </section>

          <section className="admin-section">
            <p className="eyebrow">Proofs awaiting review — 24h clock runs, then auto-refund</p>
            {data.inReview.length === 0 && <p style={{ color: "var(--slate)", marginTop: 6 }}>Nothing waiting.</p>}
            {data.inReview.map((d: any) => (
              <div key={d.id} className="admin-card panel">
                <strong>{d.category_emoji} {d.category_label}</strong> — {d.doer_name} ({d.id})
                <div className="mono" style={{ fontSize: 12, color: "var(--slate)" }}>
                  pot {formatSol(BigInt(d.pot))} SOL · review closes in {reviewDeadline(d)}
                  {d.proof_note && <> · note: {d.proof_note}</>}
                </div>
                <div className="admin-actions">
                  <button className="btn" onClick={() => void watchProof(d.id)}>Watch proof</button>
                  <button className="btn btn--jade" onClick={() => act({ action: "approve", dareId: d.id })}>
                    Approve & pay
                  </button>
                  <button
                    className="btn btn--flare"
                    onClick={() => {
                      const reason = prompt("Rejection reason (the doer sees this):");
                      if (reason) void act({ action: "reject", dareId: d.id, reason });
                    }}
                  >
                    Reject & refund
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="admin-section">
            <p className="eyebrow">Flagged dares — clear before they hit the board</p>
            {data.flagged.length === 0 && <p style={{ color: "var(--slate)", marginTop: 6 }}>Queue empty.</p>}
            {data.flagged.map((d: any) => (
              <div key={d.id} className="admin-card panel">
                <strong>{d.category_emoji} {d.category_label}</strong> — {d.doer_name} ({d.id})
                <div style={{ fontSize: 13, margin: "4px 0" }}>&ldquo;{d.detail}&rdquo;</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--slate)" }}>
                  {d.doer_wallet} · target {formatSol(BigInt(d.target))} SOL
                  {d.doer_instagram && <> · @{d.doer_instagram}</>}
                </div>
                <div className="admin-actions">
                  <button className="btn btn--jade" onClick={() => act({ action: "clear_flag", dareId: d.id })}>
                    Clear — put it on the board
                  </button>
                  <button
                    className="btn btn--flare"
                    onClick={() => {
                      const reason = prompt("Kill reason:") ?? "rule break";
                      void act({ action: "kill", dareId: d.id, reason });
                    }}
                  >
                    Kill & refund
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="admin-section">
            <p className="eyebrow">Failed refunds — fix the cause, then retry</p>
            {data.failedRefunds.length === 0 && <p style={{ color: "var(--slate)", marginTop: 6 }}>None. Good.</p>}
            {data.failedRefunds.map((p: any) => (
              <div key={p.signature} className="admin-card panel">
                <span className="mono" style={{ fontSize: 12 }}>
                  {formatSol(BigInt(p.lamports))} SOL → {p.backer_wallet} (dare {p.dare_id})
                </span>
                <div className="admin-actions">
                  <button className="btn btn--jade" onClick={() => act({ action: "retry_refund", pledgeSignature: p.signature })}>
                    Retry
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="admin-section">
            <p className="eyebrow">Orphan payments — SOL that arrived with no tag</p>
            {data.orphans.length === 0 && <p style={{ color: "var(--slate)", marginTop: 6 }}>None.</p>}
            {data.orphans.map((o: any) => (
              <div key={o.signature} className="admin-card panel">
                <span className="mono" style={{ fontSize: 12 }}>
                  {formatSol(BigInt(o.lamports))} SOL from {o.from_wallet ?? "?"} · {ago(o.seen_at)}
                  {o.memo && <> · memo: {o.memo}</>}
                </span>
                <div style={{ fontSize: 12, color: "var(--slate)" }}>{o.note}</div>
                <div className="admin-actions">
                  <button
                    className="btn"
                    onClick={() => {
                      const reason = prompt("Resolution note:") ?? "resolved";
                      void act({ action: "resolve_orphan", orphanSignature: o.signature, reason });
                    }}
                  >
                    Mark resolved
                  </button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {proofUrl && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(20,32,46,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
          }}
          onClick={() => setProofUrl(null)}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={proofUrl} controls autoPlay style={{ maxWidth: "90vw", maxHeight: "85vh", border: "3px solid #fff" }} />
        </div>
      )}
    </div>
  );
}
