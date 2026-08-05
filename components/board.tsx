"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DareCard } from "@/components/dare-card";
import { Rv } from "@/components/reveal";
import type { PublicDare } from "@/lib/dares";

type FilterKey = "all" | "closing" | "nearly" | "new";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "closing", label: "Closing soon" },
  { key: "nearly", label: "Nearly funded" },
  { key: "new", label: "Just posted" },
];

export function Board({ dares }: { dares: PublicDare[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const open = useMemo(() => dares.filter((d) => d.status === "OPEN"), [dares]);
  const funded = useMemo(
    () => dares.filter((d) => d.status === "CLOSED" || d.status === "IN_REVIEW"),
    [dares]
  );
  const paid = useMemo(() => dares.filter((d) => d.status === "PAID"), [dares]);

  const shown = useMemo(() => {
    const list = [...open];
    const fill = (d: PublicDare) => Number(BigInt(d.pot) * 1000n / BigInt(d.target));
    switch (filter) {
      case "closing":
        return list.sort(
          (a, b) => new Date(a.funding_ends_at).getTime() - new Date(b.funding_ends_at).getTime()
        );
      case "nearly":
        return list.sort((a, b) => fill(b) - fill(a));
      case "new":
        return list.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return list;
    }
  }, [open, filter]);

  return (
    <>
      <div className="wrap section" id="board">
        <Rv className="section-head">
          <div>
            <p className="eyebrow">The board</p>
            <h2 className="h2" style={{ marginTop: 9 }}>Open right now</h2>
          </div>
          <div className="filters" role="group" aria-label="Sort the board">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className="filter"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Rv>

        {shown.length > 0 && (
          <div className="grid">
            {shown.map((d, i) => (
              <Rv key={d.id} index={i}>
                <DareCard dare={d} />
              </Rv>
            ))}
          </div>
        )}

        <Rv
          className="card card-pad"
          style={{
            marginTop: shown.length ? 22 : 0,
            display: "flex", gap: 18, alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap",
          }}
        >
          <div>
            <p className="h3">{shown.length === 0 ? "Nothing open right now." : "Nothing else open right now."}</p>
            <p className="muted small" style={{ marginTop: 4 }}>
              Somebody has to go first. It costs 0.02 SOL to post.
            </p>
          </div>
          <Link className="btn btn-primary" href="/create">
            <span>Post your dare</span><span className="arrow">→</span>
          </Link>
        </Rv>

        {funded.length > 0 && (
          <>
            <Rv as="p" className="eyebrow" style={{ margin: "40px 0 16px" }}>
              Funded — waiting on proof
            </Rv>
            <div className="grid">
              {funded.map((d, i) => (
                <Rv key={d.id} index={i}>
                  <DareCard dare={d} />
                </Rv>
              ))}
            </div>
          </>
        )}

        {paid.length > 0 && (
          <>
            <Rv as="p" className="eyebrow" style={{ margin: "40px 0 16px" }}>
              The wall — done and paid
            </Rv>
            <div className="grid">
              {paid.map((d, i) => (
                <Rv key={d.id} index={i}>
                  <DareCard dare={d} />
                </Rv>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
