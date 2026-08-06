"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DareCard } from "@/components/dare-card";
import { Rv } from "@/components/reveal";
import { useT } from "@/components/locale-provider";
import type { PublicDare } from "@/lib/dares";

type FilterKey = "all" | "closing" | "nearly" | "new";

export function Board({ dares }: { dares: PublicDare[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const t = useT();
  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: t.board.filters.all },
    { key: "closing", label: t.board.filters.closing },
    { key: "nearly", label: t.board.filters.nearly },
    { key: "new", label: t.board.filters.fresh },
  ];

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
            <p className="eyebrow">{t.board.eyebrow}</p>
            <h2 className="h2" style={{ marginTop: 9 }}>{t.board.heading}</h2>
          </div>
          <div className="filters" role="group" aria-label={t.board.eyebrow}>
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
            <p className="h3">{shown.length === 0 ? t.board.emptyTitle : t.board.elseTitle}</p>
            <p className="muted small" style={{ marginTop: 4 }}>{t.board.emptySub}</p>
          </div>
          <Link className="btn btn-primary" href="/create">
            <span>{t.home.post}</span><span className="arrow">→</span>
          </Link>
        </Rv>

        {funded.length > 0 && (
          <>
            <Rv as="p" className="eyebrow" style={{ margin: "40px 0 16px" }}>
              {t.board.funded}
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
              {t.board.wall}
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
