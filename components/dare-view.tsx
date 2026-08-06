"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Tote, Therm, fillPct } from "@/components/tote";
import { Clock } from "@/components/clock";
import { StatusStamp } from "@/components/status-stamp";
import { Rv } from "@/components/reveal";
import { BackModal } from "@/components/back-modal";
import { ShareCard } from "@/components/share-card";
import { burst } from "@/components/confetti";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { formatSol, padSol } from "@/lib/format";
import { useT } from "@/components/locale-provider";
import type { PublicDare, PublicPledge } from "@/lib/dares";

const AVATAR_BG = ["#B8D0EC", "#FFD9A0", "#C9EBD9", "#EED0D0", "#D8E3EF"];

function Avatar({ name, i = -1 }: { name: string; i?: number }) {
  return (
    <span
      className="avatar"
      style={i >= 0 ? { background: AVATAR_BG[i % AVATAR_BG.length] } : undefined}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

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
  const [freshSigs, setFreshSigs] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState(false);
  const t = useT();
  const { session } = useAuth();
  const connect = useConnectOrSignIn();
  const seen = useRef(new Set(initialPledges.map((p) => p.signature)));
  const status = useRef(initialDare.status);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/dares/${initialDare.id}`, { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      const fresh = new Set<string>();
      for (const p of d.pledges as PublicPledge[]) {
        if (!seen.current.has(p.signature)) {
          fresh.add(p.signature);
          seen.current.add(p.signature);
        }
      }
      if (fresh.size) setFreshSigs(fresh);
      // The moment it closes or pays while someone watches: celebrate.
      if (status.current === "OPEN" && d.dare.status === "CLOSED") {
        burst(innerWidth * 0.7, innerHeight * 0.4, 80);
      }
      if (status.current !== "PAID" && d.dare.status === "PAID") {
        burst(innerWidth * 0.68, innerHeight * 0.34, 90);
      }
      status.current = d.dare.status;
      setDare(d.dare);
      setPledges(d.pledges);
    } catch {
      /* next poll */
    }
  }, [initialDare.id]);

  useEffect(() => {
    const iv = setInterval(refresh, 6000);
    return () => clearInterval(iv);
  }, [refresh]);

  // Arriving on a freshly paid dare is a celebration too.
  useEffect(() => {
    if (initialDare.status === "PAID") {
      const t = setTimeout(() => burst(innerWidth * 0.68, innerHeight * 0.34, 90), 550);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pot = BigInt(dare.pot);
  const target = BigInt(dare.target);
  const toGo = target > pot ? target - pot : 0n;
  const pct = fillPct(pot, target);
  const terminal = ["PAID", "REFUNDED", "KILLED"].includes(dare.status);
  const dead = ["REFUNDING", "REFUNDED", "KILLED"].includes(dare.status);
  const payout = (pot * 9000n) / 10000n;
  const cut = pot - payout;

  const refundsSent = pledges.filter((p) => p.refund_status === "SENT");
  const windowOpen =
    !!dare.proof_public_until && new Date(dare.proof_public_until) > new Date();

  const whatHappened =
    (dare.status === "KILLED"
      ? t.reasons.killed
      : dare.reject_reason
      ? t.reasons.rejected(dare.reject_reason)
      : dare.proof_due_at && new Date(dare.proof_due_at) < new Date() && pot >= target
      ? t.reasons.noProof
      : t.reasons.missedTarget(formatSol(pot), formatSol(target))) +
    " " + t.reasons.tail(dare.doer_name);

  return (
    <div className="wrap detail-grid">
      {/* ---------------- left column ---------------- */}
      <div className="stack">
        <Rv>
          <div style={{ display: "flex", gap: 11, alignItems: "center", flexWrap: "wrap" }}>
            <StatusStamp status={dare.status} big={terminal} />
            <span className="chip">{dare.category_emoji} <strong>{dare.category_short}</strong></span>
            <span className="chip mono">{dare.id}</span>
          </div>
          <h1 className="h2" style={{ marginTop: terminal ? 20 : 18 }}>{dare.category_label}</h1>
          {dare.detail && <p className="lede" style={{ marginTop: 13 }}>{dare.detail}</p>}
          <div className="dare-doer" style={{ marginTop: 18 }}>
            <Avatar name={dare.doer_name} />
            <span>
              {dare.status === "PAID" ? t.dare.doneBy : t.dare.postedBy} <b>{dare.doer_name}</b>
              {dare.doer_instagram && (
                <>
                  {" · "}
                  {/* Link out rather than mirror: Instagram is where the
                      real face, the real followers and the real reporting
                      tools live. We don't try to reproduce any of that. */}
                  <a
                    className="mono small"
                    href={`https://instagram.com/${dare.doer_instagram}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    @{dare.doer_instagram} ↗
                  </a>
                  {dare.verified ? (
                    <span className="verified-tick" title="This handle was confirmed by the person who owns it">
                      {t.dare.verified}
                    </span>
                  ) : (
                    <span className="small muted" style={{ marginLeft: 6 }}>
                      {t.dare.unconfirmed}
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
        </Rv>

        {flagged && (
          <Rv className="notice">
            <b>{t.dare.flaggedTitle}</b> {t.dare.flaggedBody}
          </Rv>
        )}

        {/* proof video: public while the window is open, owner any time */}
        {dare.has_proof && (dare.status === "PAID" || isOwner) && (
          <Rv className="card" style={{ padding: 0, overflow: "hidden" }}>
            <ProofVideo dareId={dare.id} />
            <div className="card-pad" style={{ borderTop: "2px solid var(--ink)" }}>
              {dare.proof_note && (
                <>
                  <p className="eyebrow">{t.dare.noteFrom(dare.doer_name)}</p>
                  <p style={{ marginTop: 7, marginBottom: 12 }}>{dare.proof_note}</p>
                </>
              )}
              {windowOpen && (
                <p className="small muted">
                  {t.dare.comesDownIn}{" "}
                  <Clock until={dare.proof_public_until!} urgentUnderHours={6} className="small" />
                  {" "}{t.dare.comesDownTail}
                </p>
              )}
            </div>
          </Rv>
        )}

        {/* the file is gone, but the dare still happened */}
        {dare.status === "PAID" && dare.proof_deleted_at && (
          <Rv className="notice notice-cool">
            <b>{t.dare.videoGoneTitle}</b> {t.dare.videoGoneBody}
          </Rv>
        )}

        {/* what happened — dead dares tell their story */}
        {dead && (
          <Rv className="card card-pad">
            <p className="eyebrow">{t.dare.whatHappened}</p>
            {/* One string, not text interleaved with {expressions}: JSX eats
                the space around an expression that sits at a line boundary,
                and "Kikikeeps nothing" is the kind of typo nobody catches in
                review but everybody sees on the page. */}
            <p style={{ marginTop: 9 }}>{whatHappened}</p>
            {dare.status === "REFUNDING" && (
              <p style={{ marginTop: 11 }} className="muted small">
                {t.reasons.refundingNow}
              </p>
            )}
          </Rv>
        )}

        {/* refunds sent list */}
        {dead && refundsSent.length > 0 && (
          <Rv className="card card-pad">
            <p className="eyebrow">{t.dare.refundsSent}</p>
            <div className="backers" style={{ marginTop: 11 }}>
              {refundsSent.map((p, i) => (
                <div className="backer" key={p.signature}>
                  <Avatar name={p.backer} i={i} />
                  <span className="backer-note mono small">{p.backer}</span>
                  <span className="backer-amt">{padSol(BigInt(p.lamports))} ↩</span>
                </div>
              ))}
            </div>
          </Rv>
        )}

        {/* what counts as proof */}
        {!dead && dare.status !== "PAID" && (
          <Rv className="card card-pad">
            <p className="eyebrow">{t.dare.proofMeans}</p>
            <p style={{ marginTop: 9 }}>
              {dare.category_blurb}{" "}
              {t.dare.proofRejected}
            </p>
            <p style={{ marginTop: 11 }} className="small muted">
              {dare.doer_name} also has to open the video by saying or showing
              the dare code <span className="mono" style={{ color: "var(--ink)" }}>{dare.id}</span> — so
              nobody can pass off a video they didn&apos;t film for this.
            </p>
          </Rv>
        )}

        {/* backers */}
        {!dead && (
          <Rv className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p className="eyebrow">
                {dare.status === "PAID" ? t.dare.backersMade : t.dare.backersTitle}
              </p>
              <span className="mono small muted">{dare.backer_count}</span>
            </div>
            {pledges.length === 0 ? (
              <p className="muted small" style={{ marginTop: 11 }}>
                {t.dare.noBackers}
              </p>
            ) : (
              <div className="backers" style={{ marginTop: 11 }}>
                {pledges.map((p, i) => (
                  <div
                    className={`backer${freshSigs.has(p.signature) ? " fresh" : ""}`}
                    key={p.signature}
                  >
                    <Avatar name={p.backer} i={i} />
                    <span className="backer-note">
                      {p.note ? `"${p.note}"` : <span className="mono">{p.backer}</span>}
                    </span>
                    <span className="backer-amt">{padSol(BigInt(p.lamports))}</span>
                  </div>
                ))}
              </div>
            )}
          </Rv>
        )}
      </div>

      {/* ---------------- right column ---------------- */}
      <div className="stack sticky">
        {dare.status === "PAID" ? (
          <>
            <Rv className="receipt">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p className="eyebrow">{t.dare.receipt}</p>
                <span className="stamp stamp-paid">{t.dare.paidStamp}</span>
              </div>
              <Tote value={padSol(payout)} size="lg" style={{ margin: "20px 0 10px" }} />
              <div style={{ marginBottom: 22 }}>
                <Therm pct={100} state="done" notch={false} />
              </div>
              <div className="rowline"><span>{t.dare.potLbl}</span><span className="mono">{padSol(pot)}</span></div>
              <div className="rowline"><span>{t.dare.backersTitle}</span><span className="mono">{dare.backer_count}</span></div>
              <div className="rowline"><span>{t.dare.platformCut}</span><span className="mono">{padSol(cut)}</span></div>
              <div className="rowline"><span>{t.dare.paidTo(dare.doer_name)}</span><b className="mono">{padSol(payout)}</b></div>
              {dare.settled_at && (
                <div className="rowline">
                  <span>{t.dare.settled}</span>
                  <span className="mono small">
                    {new Date(dare.settled_at).toLocaleString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit", timeZone: "UTC",
                    })}{" "}UTC
                  </span>
                </div>
              )}
              {dare.payout_signature && (
                <div className="rowline">
                  <span>{t.dare.transaction}</span>
                  <a
                    className="mono small"
                    style={{ color: "var(--field)" }}
                    href={`https://solscan.io/tx/${dare.payout_signature}`}
                    target="_blank" rel="noopener noreferrer"
                  >
                    {dare.payout_signature.slice(0, 4)}…{dare.payout_signature.slice(-4)} ↗
                  </a>
                </div>
              )}
              {/* The torn-paper edge has to sit flush under the receipt —
                  in the parent stack's gap it just reads as empty space. */}
              <div className="receipt-perf" style={{ margin: "28px -28px -28px" }} />
            </Rv>
            <Rv><ShareCard dare={dare} /></Rv>
            <Rv className="notice notice-ok">
              <b>{t.dare.yourTurn}</b> {t.dare.yourTurnBody(dare.doer_name, formatSol(target))}
              <div style={{ marginTop: 13 }}>
                <Link className="btn btn-sm btn-primary" href="/create"><span>{t.home.post}</span></Link>
              </div>
            </Rv>
          </>
        ) : dead ? (
          <>
            <Rv className="card card-pad">
              <p className="eyebrow">{t.dare.finalTote}</p>
              <Tote value={padSol(pot)} size="lg" style={{ margin: "18px 0 10px" }} />
              <div style={{ position: "relative", marginBottom: 28 }}>
                <Therm pct={pct} state="dead" targetLabel={t.dare.target(formatSol(target))} />
              </div>
              <div className="rowline"><span>{t.dare.backersTitle}</span><span className="mono">{dare.backer_count}</span></div>
              <div className="rowline"><span>{t.dare.refundedLbl}</span><b className="mono">{t.dare.refundedFull(formatSol(pot))}</b></div>
              <div className="rowline"><span>{t.dare.deducted}</span><span className="mono">{t.dare.nothing}</span></div>
              {dare.settled_at && (
                <div className="rowline">
                  <span>{t.dare.closed}</span>
                  <span className="mono small">
                    {new Date(dare.settled_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </Rv>
            <Rv className="notice notice-cool">
              <b>{t.dare.missingTitle}</b>{" "}{t.dare.missingBody}
              <div style={{ marginTop: 13 }}>
                <a
                  className="btn btn-sm"
                  href="https://instagram.com/puhblicity"
                  target="_blank" rel="noopener noreferrer"
                >
                  <span>{t.dare.reportMissing}</span>
                </a>
              </div>
            </Rv>
            {isOwner && dare.status !== "KILLED" && (
              <Rv className="card card-pad">
                <p className="eyebrow">{t.dare.tryAgain}</p>
                <p style={{ marginTop: 9 }} className="small muted">
                  {t.dare.tryAgainBody}
                </p>
                <div style={{ marginTop: 13 }}>
                  <Link className="btn btn-sm btn-primary" href="/create"><span>{t.dare.postAgain}</span></Link>
                </div>
              </Rv>
            )}
          </>
        ) : (
          <>
            <Rv className="panel on-field" style={{ padding: 26 }}>
              <p className="eyebrow">{t.dare.inThePot}</p>
              <Tote value={padSol(pot)} size="lg" onField style={{ margin: "16px 0 22px" }} />
              <Therm
                pct={pct}
                state={pot >= target ? "done" : "live"}
                onField
                targetLabel={`target ${formatSol(target)}`}
              />
              <div className="therm-scale" style={{ color: "#8FB2DA", marginTop: 28 }}>
                <span>
                  {pot >= target ? t.dare.targetHit : t.dare.toGo(formatSol(toGo))}
                </span>
                <span>{t.dare.ceiling}</span>
              </div>
            </Rv>

            <Rv className="card card-pad">
              {dare.status === "OPEN" ? (
                <>
                  <div className="rowline"><span>{t.dare.closesIn}</span><Clock until={dare.funding_ends_at} /></div>
                  <div className="rowline"><span>{t.dare.backersTitle}</span><span className="mono">{dare.backer_count}</span></div>
                  <div className="rowline"><span>{t.dare.ifHits}</span><span className="mono">{t.dare.ifHitsVal(dare.doer_name)}</span></div>
                  <div className="rowline"><span>{t.dare.ifNot}</span><span className="mono">{t.dare.ifNotVal}</span></div>
                  {paused ? (
                    <div className="notice" style={{ marginTop: 20 }}>
                      <b>{t.dare.pausedTitle}</b> {t.dare.pausedBody}
                    </div>
                  ) : session ? (
                    <button
                      className="btn btn-primary btn-block"
                      style={{ marginTop: 20 }}
                      onClick={() => setModal(true)}
                      disabled={flagged}
                    >
                      <span>{t.dare.backCta}</span>
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={connect}>
                      <span>{t.dare.connectToBack}</span>
                    </button>
                  )}
                  <p className="hint" style={{ marginTop: 13 }}>
                    {t.dare.minNote}
                  </p>
                </>
              ) : (
                <>
                  <div className="rowline"><span>{t.dare.statusLbl}</span><span className="mono">{dare.status === "CLOSED" ? t.dare.waitingProof : t.dare.proofInReview}</span></div>
                  {dare.proof_due_at && dare.status === "CLOSED" && (
                    <div className="rowline"><span>{t.dare.proofDueIn}</span><Clock until={dare.proof_due_at} urgentUnderHours={12} /></div>
                  )}
                  <div className="rowline"><span>{t.dare.potLbl}</span><b className="mono">{formatSol(pot)} SOL</b></div>
                  <div className="rowline"><span>{t.dare.doerGets(dare.doer_name)}</span><b className="mono">{t.dare.afterCut(formatSol(payout))}</b></div>
                  {isOwner && (
                    <Link className="btn btn-primary btn-block" href={`/prove/${dare.id}`} style={{ marginTop: 20 }}>
                      <span>{dare.status === "CLOSED" ? t.dare.sendProof : t.dare.replaceProof}</span>
                      <span className="arrow">→</span>
                    </Link>
                  )}
                </>
              )}
            </Rv>

            {dare.status === "OPEN" && (
              <Rv className="notice">
                <b>{t.dare.headsUp}</b> {t.dare.inFlight}
              </Rv>
            )}
            {isOwner && dare.status === "IN_REVIEW" && dare.reject_reason && (
              <Rv className="notice">
                <b>{t.dare.prevRejected}</b> {dare.reject_reason}
              </Rv>
            )}
          </>
        )}
      </div>

      {modal && (
        <BackModal
          dare={dare}
          vault={vault}
          onClose={() => setModal(false)}
          onBacked={(lamports) => {
            setModal(false);
            burst(innerWidth / 2, innerHeight / 2, 40);
            void refresh();
            void lamports;
          }}
        />
      )}
    </div>
  );
}

function ProofVideo({ dareId }: { dareId: string }) {
  const t = useT();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/proof/view?dare=${dareId}`)
      .then((r) => r.json())
      .then((d) => (d.url ? setUrl(d.url) : setError(d.error)))
      .catch(() => setError("Could not load the proof"));
  }, [dareId]);
  if (error) return null;
  return url ? (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video src={url} controls playsInline style={{ width: "100%", background: "var(--ink)" }} />
  ) : (
    <div
      style={{
        background: "var(--ink)", aspectRatio: "16/9", display: "flex",
        alignItems: "center", justifyContent: "center", color: "var(--gold)",
        fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: ".12em",
      }}
    >
      ▶ &nbsp;{t.dare.theProof.toUpperCase()}
    </div>
  );
}
