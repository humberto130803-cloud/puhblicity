import Link from "next/link";
import { Tote } from "@/components/tote";
import { remaining } from "@/lib/format";
import type { PublicDare } from "@/lib/dares";
import { StatusStamp } from "@/components/status-stamp";

export function DareCard({ dare }: { dare: PublicDare }) {
  return (
    <Link href={`/d/${dare.id}`} className="dare-card panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
        <span className="eyebrow">
          {dare.id} · {dare.doer_name}
        </span>
        <StatusStamp status={dare.status} />
      </div>
      <div className="dare-card__cat">
        {dare.category_emoji} {dare.category_label}
      </div>
      <div className="dare-card__detail">{dare.detail}</div>
      <Tote pot={BigInt(dare.pot)} target={BigInt(dare.target)} size="sm" />
      <div className="dare-card__meta">
        <span>{dare.backer_count} backer{dare.backer_count === 1 ? "" : "s"}</span>
        <span>
          {dare.status === "OPEN" ? `${remaining(dare.funding_ends_at)} left` : ""}
        </span>
      </div>
    </Link>
  );
}
