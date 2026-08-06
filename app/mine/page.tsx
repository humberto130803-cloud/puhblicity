"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Rv } from "@/components/reveal";
import { Clock } from "@/components/clock";
import { StatusStamp } from "@/components/status-stamp";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { formatSol, padSol, shortWallet } from "@/lib/format";
import { useT, useLocale } from "@/components/locale-provider";
import type { PublicDare } from "@/lib/dares";

/* eslint-disable @typescript-eslint/no-explicit-any */

type MineDare = PublicDare & { flagged: boolean };

export default function MinePage() {
  const t = useT();
  const locale = useLocale();
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
          <p className="h3" style={{ marginBottom: 6 }}>{t.mine.connectTitle}</p>
          <p className="muted small" style={{ marginBottom: 16 }}>
            {t.mine.connectBody}
          </p>
          <button className="btn btn-primary" onClick={connect}><span>{t.mine.connect}</span></button>
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
        <h1 className="h2" style={{ margin: "11px 0 28px" }}>{t.mine.heading}</h1>
      </Rv>

      {data?.stats && (
        <Rv className="statgrid" style={{ marginBottom: 34 }}>
          <div className="stat"><span className="eyebrow">{t.mine.paidToMe}</span><b>{padSol(BigInt(data.stats.paidToMe))}</b></div>
          <div className="stat"><span className="eyebrow">{t.mine.inOpenPots}</span><b>{padSol(BigInt(data.stats.inOpenPots))}</b></div>
          <div className="stat"><span className="eyebrow">{t.mine.iBacked}</span><b>{padSol(BigInt(data.stats.backed))}</b></div>
          <div className="stat"><span className="eyebrow">{t.mine.refundedToMe}</span><b>{padSol(BigInt(data.stats.refundedToMe))}</b></div>
        </Rv>
      )}

      {dares.some((d) => d.flagged && d.status === "OPEN") && (
        <Rv className="notice notice-cool" style={{ marginBottom: 20 }}>
          <b>{t.mine.queueTitle}</b> {t.mine.queueBody}
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
                {t.mine.willReceive(formatSol(BigInt(d.pot)), formatSol((BigInt(d.pot) * 9000n) / 10000n))}
              </p>
            </div>
            {d.proof_due_at && (
              <div style={{ textAlign: "right" }}>
                <p className="eyebrow">{t.mine.timeLeft}</p>
                <Clock until={d.proof_due_at} urgentUnderHours={48} className="" />
              </div>
            )}
          </div>
          <Link className="btn btn-primary btn-block" href={`/prove/${d.id}`} style={{ marginTop: 20 }}>
            <span>{t.dare.sendProof}</span><span className="arrow">→</span>
          </Link>
        </Rv>
      ))}

      <Rv as="p" className="eyebrow" style={{ marginBottom: 13 }}>
        {dares.length ? t.mine.everythingElse : t.mine.yourDares}
      </Rv>
      {rest.length === 0 && needsProof.length === 0 ? (
        <Rv className="card card-pad" style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <p className="h3">{t.mine.emptyTitle}</p>
            <p className="muted small" style={{ marginTop: 4 }}>{t.mine.emptyBody}</p>
          </div>
          <Link className="btn btn-primary" href="/create"><span>{t.mine.postYours}</span><span className="arrow">→</span></Link>
        </Rv>
      ) : (
        <Rv className="card" style={{ overflow: "hidden" }}>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr><th>{t.mine.thDare}</th><th>{t.mine.thPot}</th><th>{t.mine.thStatus}</th><th>{t.mine.thSettled}</th><th></th></tr>
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
                        ? `${t.status.REFUNDED} · ${d.settled_at ? new Date(d.settled_at).toLocaleDateString(locale === "es" ? "es-419" : "en-GB", { day: "numeric", month: "short" }) : ""}`
                        : "—"}
                    </td>
                    <td>
                      <Link className="btn btn-sm btn-ghost" href={`/d/${d.id}`}>
                        <span>{d.status === "PAID" ? t.mine.receipt : t.mine.view}</span>
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
            {t.mine.iveBacked}
          </Rv>
          <Rv className="card" style={{ overflow: "hidden" }}>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr><th>{t.mine.thDare}</th><th>{t.mine.thMyPledge}</th><th>{t.mine.thStatus}</th><th></th></tr>
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
                          <span className="stamp stamp-refunded">{t.mine.refundedInFull}</span>
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
                            <span>{t.mine.tx}</span>
                          </a>
                        ) : p.dare ? (
                          <Link className="btn btn-sm btn-ghost" href={`/d/${p.dare.id}`}>
                            <span>{t.mine.watch}</span>
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
