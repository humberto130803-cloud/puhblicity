import Link from "next/link";
import { listBoardDares, getSettings } from "@/lib/dares";
import { DareCard } from "@/components/dare-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [dares, settings] = await Promise.all([listBoardDares(), getSettings()]);
  const live = dares.filter((d) => d.status === "OPEN" || d.status === "CLOSED" || d.status === "IN_REVIEW");
  const settled = dares.filter((d) => d.status === "PAID");

  return (
    <div className="wrap">
      <section className="hero">
        <p className="eyebrow">A public board of self-inflicted, funded dares</p>
        <h1 className="display">
          Name your price.
          <br />
          <span style={{ color: "var(--flare)" }}>Do the thing.</span>
        </h1>
        <p className="sub">
          You offer the dare. Strangers fill the pot. Hit the target, film the
          proof, get paid. Miss anything and every backer gets every lamport
          back — automatically.
        </p>
        <p style={{ marginTop: 18 }}>
          <Link href="/create" className="btn btn--flare">
            Open a dare — 0.02 SOL
          </Link>
          <Link href="/money" className="btn" style={{ marginLeft: 10 }}>
            How the money works
          </Link>
        </p>
      </section>

      {settings.paused && (
        <div className="notice notice--warn" role="alert" style={{ marginBottom: 20 }}>
          PUHBLICITY is paused right now. Nothing new opens until it&apos;s back.
          Money already pledged is safe: refunds and payouts keep running.
        </div>
      )}

      <section aria-label="Open dares">
        {live.length === 0 ? (
          <div className="panel" style={{ padding: 28, textAlign: "center" }}>
            <p className="display" style={{ fontSize: 26 }}>
              No dares open right now.
            </p>
            <p style={{ color: "var(--slate)", marginTop: 6 }}>
              Somebody has to go first.
            </p>
          </div>
        ) : (
          <div className="board-grid">
            {live.map((d) => (
              <DareCard key={d.id} dare={d} />
            ))}
          </div>
        )}
      </section>

      {settled.length > 0 && (
        <section aria-label="The wall" style={{ marginTop: 30 }}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            The wall — done and paid
          </p>
          <div className="board-grid">
            {settled.map((d) => (
              <DareCard key={d.id} dare={d} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
