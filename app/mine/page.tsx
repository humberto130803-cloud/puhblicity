"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { DareCard } from "@/components/dare-card";
import type { PublicDare } from "@/lib/dares";

type MineDare = PublicDare & { flagged: boolean };

export default function MinePage() {
  const { session } = useAuth();
  const connect = useConnectOrSignIn();
  const [dares, setDares] = useState<MineDare[] | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/mine")
      .then((r) => r.json())
      .then((d) => setDares(d.dares ?? []))
      .catch(() => setDares([]));
  }, [session]);

  return (
    <div className="wrap">
      <section className="hero" style={{ paddingBottom: 16 }}>
        <p className="eyebrow">My dares</p>
        <h1 className="display" style={{ fontSize: "clamp(30px, 5vw, 52px)" }}>
          Your side of the board
        </h1>
      </section>

      {!session ? (
        <div className="panel" style={{ padding: 24 }}>
          <p style={{ marginBottom: 12 }}>Connect to see your dares.</p>
          <button className="btn btn--flare" onClick={connect}>
            Connect wallet
          </button>
        </div>
      ) : dares === null ? (
        <p style={{ color: "var(--slate)" }}>Loading…</p>
      ) : dares.length === 0 ? (
        <div className="panel" style={{ padding: 24 }}>
          <p>
            Nothing yet. <a href="/create">Open your first dare</a> — somebody
            has to go first.
          </p>
        </div>
      ) : (
        <>
          {dares.some((d) => d.flagged && d.status === "OPEN") && (
            <div className="notice notice--warn" style={{ marginBottom: 16 }}>
              A dare of yours is waiting for a quick human check before it
              shows on the public board. It&apos;s usually fast.
            </div>
          )}
          <div className="board-grid" style={{ paddingBottom: 40 }}>
            {dares.map((d) => (
              <DareCard key={d.id} dare={d} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
