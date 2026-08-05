"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Rv } from "@/components/reveal";
import { Clock } from "@/components/clock";
import { StatusStamp } from "@/components/status-stamp";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { formatSol, padSol, shortWallet } from "@/lib/format";
import type { PublicDare } from "@/lib/dares";

/* eslint-disable @typescript-eslint/no-explicit-any */

type MineDare = PublicDare & { flagged: boolean };

export default function MinePage() {
  const { session } = useAuth();
  const connect = useConnectOrSignIn();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/mine")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ dares: [], backed: [], stats: null }));
  }, [session]);

  if (!session) {
    return (
      <div className="wrap" style={{ padding: "44px 24px 90px" }}>
        <div className="card card-pad" style={{ maxWidth: 480 }}>
          <p className="h3" style={{ marginBottom: 6 }}>Your side of the board</p>
          <p className="muted small" style={{ marginBottom: 16 }}>
            Connect to see your dares, your pledges, and what&apos;s owed to you.
          </p>
          <button className="btn btn-primary" onClick={connect}><span>Connect wallet</span></button>
        </div>
      </div>
    );
  }

  const dares: MineDare[] = data?.dares ?? [];
  const needsProof = dares.filter((d) => d.status === "CLOSED");
  const rest = dares.filter((d) => d.status !== "CLOSED");
  const backed: any[] = data?.backed ?? [];

  return (
    <div className="wrap" style={{ padding: "44px 24px 90px" }}>
      <Rv>
        <p className="eyebrow mono">{shortWallet(session.pubkey)}</p>
        <h1 className="h2" style={{ margin: "11px 0 28px" }}>My dares</h1>
      </Rv>

      {data?.stats && (
        <Rv className="statgrid" style={{ marginBottom: 34 }}>
          <div className="stat"><span className="eyebrow">Paid to me</span><b>{padSol(BigInt(data.stats.paidToMe))}</b></div>
          <div className="stat"><span className="eyebrow">In open pots</span><b>{padSol(BigInt(data.stats.inOpenPots))}</b></div>
          <div className="stat"><span className="eyebrow">I&apos;ve backed</span><b>{padSol(BigInt(data.stats.backed))}</b></div>
          <div className="stat"><span className="eyebrow">Refunded to me</span><b>{padSol(BigInt(data.stats.refundedToMe))}</b></div>
        </Rv>
      )}

      {dares.some((d) => d.flagged && d.status === "OPEN") && (
        <Rv className="notice notice-cool" style={{ marginBottom: 20 }}>
          <b>One of yours is in the queue.</b> A quick human check before it
          shows on the public board — usually minutes.
        </Rv>
      )}

      {/* the action-needed card: funded, clock running */}
      {needsProof.map((d) => (
        <Rv
          key={d.id}
          className="card card-pad"
          style={{ borderColor: "var(--flare)", boxShadow: "6px 6px 0 var(--flare)", marginBottom: 24 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <StatusStamp status={d.status} />
              <h3 className="h3" style={{ margin: "13px 0 6px" }}>{d.category_label}</h3>
              <p className="muted small">
                Pot {formatSol(BigInt(d.pot))} SOL · you&apos;ll receive{" "}
                {formatSol((BigInt(d.pot) * 9000n) / 10000n)} after our 10%
              </p>
            </div>
            {d.proof_due_at && (
              <div style={{ textAlign: "right" }}>
                <p className="eyebrow">Time left to prove it</p>
                <Clock until={d.proof_due_at} urgentUnderHours={48} className="" />
              </div>
            )}
          </div>
          <Link className="btn btn-primary btn-block" href={`/prove/${d.id}`} style={{ marginTop: 20 }}>
            <span>Send your proof</span><span className="arrow">→</span>
          </Link>
        </Rv>
      ))}

      <Rv as="p" className="eyebrow" style={{ marginBottom: 13 }}>
        {dares.length ? "Everything else" : "Your dares"}
      </Rv>
      {rest.length === 0 && needsProof.length === 0 ? (
        <Rv className="card card-pad" style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <p className="h3">Nothing yet.</p>
            <p className="muted small" style={{ marginTop: 4 }}>Somebody has to go first. It costs 0.02 SOL to post.</p>
          </div>
          <Link className="btn btn-primary" href="/create"><span>Post your dare</span><span className="arrow">→</span></Link>
        </Rv>
      ) : (
        <Rv className="card" style={{ overflow: "hidden" }}>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr><th>Dare</th><th>Pot</th><th>Status</th><th>Settled</th><th></th></tr>
              </thead>
              <tbody>
                {rest.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <b>{d.category_label}</b><br />
                      <span className="small muted mono">{d.id}</span>
                    </td>
                    <td className="mono">{padSol(BigInt(d.pot))}</td>
                    <td><StatusStamp status={d.status} /></td>
                    <td className="mono small">
                      {d.status === "PAID"
                        ? `${formatSol((BigInt(d.pot) * 9000n) / 10000n)} SOL · ${d.settled_at ? new Date(d.settled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}`
                        : d.status === "REFUNDED"
                        ? `Refunded · ${d.settled_at ? new Date(d.settled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}`
                        : "—"}
                    </td>
                    <td>
                      <Link className="btn btn-sm btn-ghost" href={`/d/${d.id}`}>
                        <span>{d.status === "PAID" ? "Receipt" : "View"}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Rv>
      )}

      {backed.length > 0 && (
        <>
          <Rv as="p" className="eyebrow" style={{ margin: "36px 0 13px" }}>
            Dares I&apos;ve backed
          </Rv>
          <Rv className="card" style={{ overflow: "hidden" }}>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr><th>Dare</th><th>My pledge</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {backed.map((p) => (
                    <tr key={p.signature}>
                      <td>
                        <b>{p.dare?.label ?? "—"}</b>
                        {p.dare?.doer_name && <> — {p.dare.doer_name}</>}
                      </td>
                      <td className="mono">{padSol(BigInt(p.lamports))}</td>
                      <td>
                        {p.refund_status === "SENT" ? (
                          <span className="stamp stamp-refunded">Refunded in full</span>
                        ) : p.dare ? (
                          <StatusStamp status={p.dare.status} />
                        ) : null}
                      </td>
                      <td>
                        {p.refund_status === "SENT" && p.refund_signature ? (
                          <a
                            className="btn btn-sm btn-ghost"
                            href={`https://solscan.io/tx/${p.refund_signature}`}
                            target="_blank" rel="noopener noreferrer"
                          >
                            <span>Tx</span>
                          </a>
                        ) : p.dare ? (
                          <Link className="btn btn-sm btn-ghost" href={`/d/${p.dare.id}`}>
                            <span>Watch</span>
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Rv>
        </>
      )}
    </div>
  );
}
