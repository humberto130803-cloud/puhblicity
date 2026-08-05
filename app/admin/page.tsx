"use client";

import { useCallback, useEffect, useState } from "react";
import { Rv } from "@/components/reveal";
import { Clock } from "@/components/clock";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { formatSol, padSol, shortWallet, ago } from "@/lib/format";

/* eslint-disable @typescript-eslint/no-explicit-any */

const reviewDeadline = (d: any) =>
  d.proof_submitted_at
    ? new Date(new Date(d.proof_submitted_at).getTime() + 24 * 3600_000).toISOString()
    : null;

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
      .catch(() => setMsg("Could not load the overview"));
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
      <div className="wrap" style={{ padding: "44px 24px 90px" }}>
        <div className="card card-pad" style={{ maxWidth: 480 }}>
          <p className="h3" style={{ marginBottom: 6 }}>The back of the board</p>
          <p className="muted small" style={{ marginBottom: 16 }}>
            Admin only. Sign in with the admin wallet.
          </p>
          <button className="btn btn-dark" onClick={connect}><span>Connect</span></button>
        </div>
      </div>
    );
  }

  const shortVault = data ? Number(BigInt(data.vaultBalance !== "rpc-error" ? data.vaultBalance : "0")) <
    Number(BigInt(data.refundsOwed ?? "0")) : false;

  return (
    <div className="wrap" style={{ padding: "36px 24px 90px" }}>
      {data && (
        <>
          <Rv className="statgrid" style={{ marginBottom: 16 }}>
            <div className="stat">
              <span className="eyebrow">Vault balance</span>
              <b>{data.vaultBalance === "rpc-error" ? "RPC ✕" : padSol(BigInt(data.vaultBalance))}</b>
            </div>
            <div className="stat">
              <span className="eyebrow">Open pot liability</span>
              <b>{padSol(BigInt(data.openPot))}</b>
            </div>
            <div className="stat">
              <span className="eyebrow">Owed in refunds</span>
              <b style={{ color: BigInt(data.refundsOwed ?? "0") > 0n ? "var(--flare)" : undefined }}>
                {padSol(BigInt(data.refundsOwed ?? "0"))}
              </b>
            </div>
            <div className="stat">
              <span className="eyebrow">Fees earned</span>
              <b style={{ color: "var(--jade)" }}>{padSol(BigInt(data.feesEarned ?? "0"))}</b>
            </div>
          </Rv>

          <Rv style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <button
              className={`btn btn-sm ${data.paused ? "btn-dark" : "btn-primary"}`}
              onClick={() => act({ action: data.paused ? "unpause" : "pause" })}
            >
              <span>{data.paused ? "UNPAUSE the site" : "Pause the site"}</span>
            </button>
            <span className="chip mono">{shortWallet(data.vaultPubkey)}</span>
            {data.paused && <span className="stamp stamp-killed">Site paused</span>}
          </Rv>

          {shortVault && (
            <div className="notice" role="alert" style={{ marginBottom: 20 }}>
              <b>The vault holds less than what&apos;s owed in refunds.</b> Top it
              up NOW — refunds fail without it.
            </div>
          )}

          {data.inReview.length > 0 && (
            <div className="notice" style={{ marginBottom: 32 }}>
              <b>{data.inReview.length} proof{data.inReview.length === 1 ? "" : "s"} waiting.</b>{" "}
              Anything unreviewed for 24 hours auto-refunds to backers. The
              nearest clock is at{" "}
              {reviewDeadline(data.inReview[0]) && (
                <Clock until={reviewDeadline(data.inReview[0])!} urgentUnderHours={6} />
              )}.
            </div>
          )}

          <Rv as="p" className="eyebrow" style={{ marginBottom: 13 }}>Proofs to review</Rv>
          <Rv className="card" style={{ overflow: "hidden", marginBottom: 32 }}>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr><th>Dare</th><th>Doer</th><th>Pot</th><th>Auto-refunds in</th><th>Proof</th><th></th></tr>
                </thead>
                <tbody>
                  {data.inReview.length === 0 && (
                    <tr><td colSpan={6} className="muted">Nothing waiting. Good.</td></tr>
                  )}
                  {data.inReview.map((d: any) => (
                    <tr key={d.id}>
                      <td><b>{d.category_label}</b><br /><span className="small muted mono">{d.id}</span></td>
                      <td>{d.doer_name}<br /><span className="small muted mono">{shortWallet(d.doer_wallet)}</span></td>
                      <td className="mono">{formatSol(BigInt(d.pot))}</td>
                      <td>{reviewDeadline(d) && <Clock until={reviewDeadline(d)!} urgentUnderHours={6} />}</td>
                      <td>
                        <button className="btn btn-sm" onClick={() => void watchProof(d.id)}>
                          <span>▶ Watch</span>
                        </button>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => act({ action: "approve", dareId: d.id })}
                        >
                          <span>Approve &amp; pay {formatSol((BigInt(d.pot) * 9000n) / 10000n)}</span>
                        </button>{" "}
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            const reason = prompt("Rejection reason (the doer sees this):");
                            if (reason) void act({ action: "reject", dareId: d.id, reason });
                          }}
                        >
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Rv>

          <Rv as="p" className="eyebrow" style={{ marginBottom: 13 }}>New dares waiting to clear</Rv>
          <Rv className="card" style={{ overflow: "hidden", marginBottom: 32 }}>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr><th>Dare</th><th>Specifics</th><th>Target</th><th>Wallet</th><th></th></tr>
                </thead>
                <tbody>
                  {data.flagged.length === 0 && (
                    <tr><td colSpan={5} className="muted">Queue empty.</td></tr>
                  )}
                  {data.flagged.map((d: any) => (
                    <tr key={d.id}>
                      <td><b>{d.category_label}</b><br /><span className="small muted mono">{d.id} · {d.doer_name}</span></td>
                      <td className="small">{d.detail || <span className="muted">—</span>}</td>
                      <td className="mono">{formatSol(BigInt(d.target))}</td>
                      <td className="mono small">{shortWallet(d.doer_wallet)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-sm btn-primary" onClick={() => act({ action: "clear_flag", dareId: d.id })}>
                          <span>Clear</span>
                        </button>{" "}
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            const reason = prompt("Kill reason:") ?? "rule break";
                            void act({ action: "kill", dareId: d.id, reason });
                          }}
                        >
                          <span>Kill &amp; refund</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Rv>

          <Rv as="p" className="eyebrow" style={{ marginBottom: 13 }}>Needs a human</Rv>
          <Rv className="card" style={{ overflow: "hidden" }}>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr><th>What</th><th>Detail</th><th>Amount</th><th></th></tr>
                </thead>
                <tbody>
                  {data.failedRefunds.length === 0 && data.orphans.length === 0 && (
                    <tr><td colSpan={4} className="muted">Nothing. Sleep well.</td></tr>
                  )}
                  {data.failedRefunds.map((p: any) => (
                    <tr key={p.signature}>
                      <td><b>Failed refund</b><br /><span className="small muted">{p.refund_attempts} attempts</span></td>
                      <td className="mono small">{shortWallet(p.backer_wallet)} · {p.dare_id}</td>
                      <td className="mono">{formatSol(BigInt(p.lamports))}</td>
                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => act({ action: "retry_refund", pledgeSignature: p.signature })}>
                          <span>Retry by hand</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.orphans.map((o: any) => (
                    <tr key={o.signature}>
                      <td><b>Unmatched payment</b><br /><span className="small muted">{o.memo ? `memo: ${o.memo}` : "No memo — likely sent from an exchange"}</span></td>
                      <td className="mono small">{shortWallet(o.from_wallet ?? "?")} · {ago(o.seen_at)} ago</td>
                      <td className="mono">{formatSol(BigInt(o.lamports))}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-sm" onClick={() => act({ action: "refund_orphan", orphanSignature: o.signature })}>
                          <span>Send it back</span>
                        </button>{" "}
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            const reason = prompt("Resolution note:") ?? "resolved";
                            void act({ action: "resolve_orphan", orphanSignature: o.signature, reason });
                          }}
                        >
                          <span>Dismiss</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Rv>
        </>
      )}

      {msg && (
        <div className="notice notice-cool" role="status" style={{ marginTop: 20 }}>{msg}</div>
      )}

      {proofUrl && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setProofUrl(null); }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={proofUrl}
            controls
            autoPlay
            style={{ maxWidth: "min(90vw, 900px)", maxHeight: "85vh", border: "3px solid #fff", margin: "auto" }}
          />
        </div>
      )}
    </div>
  );
}
