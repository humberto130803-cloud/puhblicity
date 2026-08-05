"use client";

import Link from "next/link";
import { Tote, Therm, fillPct, toteValue } from "@/components/tote";
import { Clock } from "@/components/clock";
import { StatusStamp } from "@/components/status-stamp";
import { formatSol, padSol } from "@/lib/format";
import type { PublicDare } from "@/lib/dares";

/** What the card foot says once the clock stops mattering. */
const FOOT_TEXT: Record<string, string> = {
  IN_REVIEW: "in review",
  PAID: "paid out",
  REFUNDING: "refunding",
  REFUNDED: "refunded",
  KILLED: "removed",
};

export function DareCard({ dare }: { dare: PublicDare }) {
  const pot = BigInt(dare.pot);
  const target = BigInt(dare.target);
  const pct = Math.round(fillPct(pot, target));
  const state =
    dare.status === "PAID" ? "done"
    : dare.status === "REFUNDING" || dare.status === "REFUNDED" || dare.status === "KILLED" ? "dead"
    : dare.status === "OPEN" ? "live" : "done";

  return (
    <article className="card dare-card">
      <div className="dare-card-top">
        <span className="dare-cat">{dare.category_emoji} {dare.category_short}</span>
        <StatusStamp status={dare.status} />
      </div>
      <h3 className="dare-title">{dare.category_label}</h3>
      <p className="dare-detail">{dare.detail || dare.category_blurb}</p>
      <Tote value={padSol(pot)} size="sm" />
      <div>
        <Therm pct={pct} state={state} />
        <div className="therm-scale">
          <span>{pct}% of {formatSol(target)} target</span>
          <span>{dare.backer_count} backer{dare.backer_count === 1 ? "" : "s"}</span>
        </div>
      </div>
      <div className="dare-foot">
        <span className="dare-doer">
          <span className="avatar">{dare.doer_name.charAt(0).toUpperCase()}</span>
          {dare.doer_name} ·{" "}
          {dare.status === "OPEN" ? (
            <Clock until={dare.funding_ends_at} className="small" />
          ) : dare.status === "CLOSED" && dare.proof_due_at ? (
            <span className="mono small muted">
              proof due <Clock until={dare.proof_due_at} urgentUnderHours={12} className="small" />
            </span>
          ) : (
            <span className="mono small muted">{FOOT_TEXT[dare.status] ?? "settled"}</span>
          )}
        </span>
        <Link className="btn btn-sm btn-primary" href={`/d/${dare.id}`}>
          <span>{dare.status === "OPEN" ? "Back this" : "See it"}</span>
        </Link>
      </div>
    </article>
  );
}
