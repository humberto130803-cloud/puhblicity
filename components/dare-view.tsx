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
      ? "This dare broke the rules and was removed. Every pledge goes back to the wallet it came from — the full amount, no fee deducted."
      : dare.reject_reason
      ? `The proof didn't pass review: "${dare.reject_reason}". Every pledge goes back to the wallet it came from — the full amount, no fee deducted.`
      : dare.proof_due_at && new Date(dare.proof_due_at) < new Date() && pot >= target
      ? "The target was hit, but proof never arrived inside the 48-hour window. Every pledge goes back to the wallet it came from — the full amount, no fee deducted."
      : `The deadline passed with ${formatSol(pot)} SOL in the pot against a ${formatSol(target)} target. Every pledge went back to the wallet it came from — the full amount, no fee deducted.`) +
    ` ${dare.doer_name} keeps nothing and the 0.02 posting fee isn't returned.`;

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
              {dare.status === "PAID" ? "Done by" : "Posted by"} <b>{dare.doer_name}</b>
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
                      ✓ verified
                    </span>
                  ) : (
                    <span className="small muted" style={{ marginLeft: 6 }}>
                      (unconfirmed)
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
        </Rv>

        {flagged && (
          <Rv className="notice">
            <b>Waiting for a quick human check</b> before it goes on the board.
            Only you can see it right now — usually minutes.
          </Rv>
        )}

        {/* proof video: public while the window is open, owner any time */}
        {dare.has_proof && (dare.status === "PAID" || isOwner) && (
          <Rv className="card" style={{ padding: 0, overflow: "hidden" }}>
            <ProofVideo dareId={dare.id} />
            <div className="card-pad" style={{ borderTop: "2px solid var(--ink)" }}>
              {dare.proof_note && (
                <>
                  <p className="eyebrow">Note from {dare.doer_name}</p>
                  <p style={{ marginTop: 7, marginBottom: 12 }}>{dare.proof_note}</p>
                </>
              )}
              {windowOpen && (
                <p className="small muted">
                  This comes down in{" "}
                  <Clock until={dare.proof_public_until!} urgentUnderHours={6} className="small" />
                  {" "}— proof videos are deleted 48 hours after payout.
                </p>
              )}
            </div>
          </Rv>
        )}

        {/* the file is gone, but the dare still happened */}
        {dare.status === "PAID" && dare.proof_deleted_at && (
          <Rv className="notice notice-cool">
            <b>The video has come down.</b> It was up for 48 hours after
            payout, then deleted — that&apos;s the deal we make with everyone who
            films themselves for this. The payout below is still on-chain and
            still checkable.
          </Rv>
        )}

        {/* what happened — dead dares tell their story */}
        {dead && (
          <Rv className="card card-pad">
            <p className="eyebrow">What happened</p>
            {/* One string, not text interleaved with {expressions}: JSX eats
                the space around an expression that sits at a line boundary,
                and "Kikikeeps nothing" is the kind of typo nobody catches in
                review but everybody sees on the page. */}
            <p style={{ marginTop: 9 }}>{whatHappened}</p>
            {dare.status === "REFUNDING" && (
              <p style={{ marginTop: 11 }} className="muted small">
                Refunds are going out now — they usually land within minutes.
              </p>
            )}
          </Rv>
        )}

        {/* refunds sent list */}
        {dead && refundsSent.length > 0 && (
          <Rv className="card card-pad">
            <p className="eyebrow">Refunds sent</p>
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
            <p className="eyebrow">What counts as proof</p>
            <p style={{ marginTop: 9 }}>
              {dare.category_blurb}{" "}
              If the proof doesn&apos;t match the dare, it&apos;s rejected and every
              backer is refunded.
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
                {dare.status === "PAID" ? "Backers who made it happen" : "Backers"}
              </p>
              <span className="mono small muted">{dare.backer_count}</span>
            </div>
            {pledges.length === 0 ? (
              <p className="muted small" style={{ marginTop: 11 }}>
                Nobody yet. First name on the wall gets remembered.
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
                <p className="eyebrow">Settlement receipt</p>
                <span className="stamp stamp-paid">Paid</span>
              </div>
              <Tote value={padSol(payout)} size="lg" style={{ margin: "20px 0 10px" }} />
              <div style={{ marginBottom: 22 }}>
                <Therm pct={100} state="done" notch={false} />
              </div>
              <div className="rowline"><span>Pot</span><span className="mono">{padSol(pot)}</span></div>
              <div className="rowline"><span>Backers</span><span className="mono">{dare.backer_count}</span></div>
              <div className="rowline"><span>Platform cut (10%)</span><span className="mono">{padSol(cut)}</span></div>
              <div className="rowline"><span>Paid to {dare.doer_name}</span><b className="mono">{padSol(payout)}</b></div>
              {dare.settled_at && (
                <div className="rowline">
                  <span>Settled</span>
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
                  <span>Transaction</span>
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
              <b>Your turn.</b> {dare.doer_name} set a {formatSol(target)} target and
              cleared it. Posting costs 0.02 SOL.
              <div style={{ marginTop: 13 }}>
                <Link className="btn btn-sm btn-primary" href="/create"><span>Post your dare</span></Link>
              </div>
            </Rv>
          </>
        ) : dead ? (
          <>
            <Rv className="card card-pad">
              <p className="eyebrow">Final tote</p>
              <Tote value={padSol(pot)} size="lg" style={{ margin: "18px 0 10px" }} />
              <div style={{ position: "relative", marginBottom: 28 }}>
                <Therm pct={pct} state="dead" targetLabel={`target ${formatSol(target)}`} />
              </div>
              <div className="rowline"><span>Backers</span><span className="mono">{dare.backer_count}</span></div>
              <div className="rowline"><span>Refunded</span><b className="mono">{formatSol(pot)} SOL — 100%</b></div>
              <div className="rowline"><span>Deducted</span><span className="mono">Nothing</span></div>
              {dare.settled_at && (
                <div className="rowline">
                  <span>Closed</span>
                  <span className="mono small">
                    {new Date(dare.settled_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </Rv>
            <Rv className="notice notice-cool">
              <b>Didn&apos;t get yours?</b>{" "}
              Refunds land within a few minutes. If yours hasn&apos;t after an
              hour, send us the transaction and we&apos;ll chase it by hand.
              <div style={{ marginTop: 13 }}>
                <a
                  className="btn btn-sm"
                  href="https://instagram.com/puhblicity"
                  target="_blank" rel="noopener noreferrer"
                >
                  <span>Report a missing refund</span>
                </a>
              </div>
            </Rv>
            {isOwner && dare.status !== "KILLED" && (
              <Rv className="card card-pad">
                <p className="eyebrow">Try again</p>
                <p style={{ marginTop: 9 }} className="small muted">
                  Lower target, longer window, and post it when your people are
                  awake. Most dares that fail are priced above their audience.
                </p>
                <div style={{ marginTop: 13 }}>
                  <Link className="btn btn-sm btn-primary" href="/create"><span>Post it again</span></Link>
                </div>
              </Rv>
            )}
          </>
        ) : (
          <>
            <Rv className="panel on-field" style={{ padding: 26 }}>
              <p className="eyebrow">In the pot</p>
              <Tote value={padSol(pot)} size="lg" onField style={{ margin: "16px 0 22px" }} />
              <Therm
                pct={pct}
                state={pot >= target ? "done" : "live"}
                onField
                targetLabel={`target ${formatSol(target)}`}
              />
              <div className="therm-scale" style={{ color: "#8FB2DA", marginTop: 28 }}>
                <span>
                  {pot >= target ? "Target hit — funding closed" : `${formatSol(toGo)} SOL to go`}
                </span>
                <span>ceiling 5.00</span>
              </div>
            </Rv>

            <Rv className="card card-pad">
              {dare.status === "OPEN" ? (
                <>
                  <div className="rowline"><span>Closes in</span><Clock until={dare.funding_ends_at} /></div>
                  <div className="rowline"><span>Backers</span><span className="mono">{dare.backer_count}</span></div>
                  <div className="rowline"><span>If it hits target</span><span className="mono">{dare.doer_name} has 48h to prove it</span></div>
                  <div className="rowline"><span>If it doesn&apos;t</span><span className="mono">Everyone refunded in full</span></div>
                  {paused ? (
                    <div className="notice" style={{ marginTop: 20 }}>
                      <b>Paused.</b> No new pledges right now. Money already in is safe.
                    </div>
                  ) : session ? (
                    <button
                      className="btn btn-primary btn-block"
                      style={{ marginTop: 20 }}
                      onClick={() => setModal(true)}
                      disabled={flagged}
                    >
                      <span>Back this dare</span>
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={connect}>
                      <span>Connect to back this</span>
                    </button>
                  )}
                  <p className="hint" style={{ marginTop: 13 }}>
                    Minimum 0.05 SOL. Pledges are final while a dare is open.
                    Pledge from your own wallet — sends from an exchange lose
                    the tag and we can&apos;t match them.
                  </p>
                </>
              ) : (
                <>
                  <div className="rowline"><span>Status</span><span className="mono">{dare.status === "CLOSED" ? "Waiting on proof" : "Proof in review"}</span></div>
                  {dare.proof_due_at && dare.status === "CLOSED" && (
                    <div className="rowline"><span>Proof due in</span><Clock until={dare.proof_due_at} urgentUnderHours={12} /></div>
                  )}
                  <div className="rowline"><span>Pot</span><b className="mono">{formatSol(pot)} SOL</b></div>
                  <div className="rowline"><span>{dare.doer_name} gets</span><b className="mono">{formatSol(payout)} after our 10%</b></div>
                  {isOwner && (
                    <Link className="btn btn-primary btn-block" href={`/prove/${dare.id}`} style={{ marginTop: 20 }}>
                      <span>{dare.status === "CLOSED" ? "Send your proof" : "Replace your proof"}</span>
                      <span className="arrow">→</span>
                    </Link>
                  )}
                </>
              )}
            </Rv>

            {dare.status === "OPEN" && (
              <Rv className="notice">
                <b>Heads up.</b> If this closes while your transaction is in
                flight, we send your SOL straight back — usually inside a minute.
              </Rv>
            )}
            {isOwner && dare.status === "IN_REVIEW" && dare.reject_reason && (
              <Rv className="notice">
                <b>Previous proof rejected:</b> {dare.reject_reason}
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
      ▶ &nbsp;THE PROOF
    </div>
  );
}
