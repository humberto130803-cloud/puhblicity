import Link from "next/link";
import { listBoardDares, getSettings } from "@/lib/dares";
import { siteStats } from "@/lib/stats";
import { formatSol, toteValue } from "@/lib/format";
import { Board } from "@/components/board";
import { Tote, Therm } from "@/components/tote";
import { Tape, Floaters, Marquee } from "@/components/hero-fx";
import { Rv } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [dares, settings, stats] = await Promise.all([
    listBoardDares(),
    getSettings(),
    siteStats(),
  ]);

  const donePct =
    stats.paidCount + stats.openCount > 0
      ? Math.max(8, Math.round((stats.paidCount / (stats.paidCount + stats.openCount)) * 100))
      : 8;

  return (
    <>
      <div className="hero">
        <Tape />
        <Floaters />
        <div className="wrap hero-inner">
          <div className="hero-grid">
            <div>
              <Rv as="p" className="eyebrow eyebrow-live">
                <i></i> {stats.openCount} dare{stats.openCount === 1 ? "" : "s"} open ·{" "}
                {formatSol(stats.openPot)} SOL in play right now
              </Rv>
              <Rv as="h1" className="h1" style={{ marginTop: 18 }}>
                <span className="line"><i>Name your</i></span>
                <span className="line"><i>price. Do</i></span>
                <span className="line"><i>the thing.</i></span>
              </Rv>
              <Rv as="p" className="hero-sub" index={1}>
                You say what you&apos;ll do. The internet decides what it&apos;s worth.
                Hit your target and you&apos;re paid — miss it and every backer gets
                their SOL back, all of it.
              </Rv>
              <Rv className="hero-cta" index={2}>
                <Link className="btn btn-primary" href="/create">
                  <span>Post your dare</span><span className="arrow">→</span>
                </Link>
                <a className="btn on-dark-btn" href="#board">
                  <span>See what&apos;s open</span>
                </a>
              </Rv>
              <Rv className="hero-rules" index={3}>
                <div><b>You go first</b>Nobody can dare you.</div>
                <div><b>5 SOL ceiling</b>The number stops.</div>
                <div><b>Full refunds</b>No target, no charge.</div>
              </Rv>
            </div>

            <Rv className="hero-tote on-field" index={1}>
              <p className="eyebrow">Paid out to doers so far</p>
              <Tote
                value={toteValue(stats.paidOutTotal)}
                size="xl"
                onField
                countUp
                style={{ margin: "18px 0 24px" }}
              />
              <Therm
                pct={donePct}
                onField
                notch={false}
                ticks={12}
              />
              <div className="therm-scale" style={{ color: "#8FB2DA" }}>
                <span>{stats.paidCount} dare{stats.paidCount === 1 ? "" : "s"} done</span>
                <span>{stats.openCount} open right now</span>
              </div>
            </Rv>
          </div>
        </div>
        <div className="scrollcue"><i></i> Scroll to the board</div>
      </div>

      <Marquee items={stats.marquee} />

      {settings.paused && (
        <div className="wrap" style={{ paddingTop: 24 }}>
          <div className="notice" role="alert">
            <b>Paused.</b> Nothing new opens until we&apos;re back. Money already
            pledged is safe — refunds and payouts keep running.
          </div>
        </div>
      )}

      <Board dares={dares} />

      <div className="wrap section" style={{ paddingTop: 0 }}>
        <Rv as="p" className="eyebrow" style={{ marginBottom: 16 }}>
          Start to finish
        </Rv>
        <Rv className="steps">
          <div className="step"><u>01</u><b>You post</b><p>Pick a dare from the menu, set your target and a deadline. 0.02 SOL to post.</p></div>
          <div className="step"><u>02</u><b>People back it</b><p>The pot climbs in public. Anyone can watch, anyone can add.</p></div>
          <div className="step"><u>03</u><b>Target hits</b><p>Funding closes on the spot. You get 48 hours.</p></div>
          <div className="step"><u>04</u><b>You send proof</b><p>One video. We check it, usually within a few hours.</p></div>
          <div className="step"><u>05</u><b>You&apos;re paid</b><p>Pot minus our 10% lands in your wallet. Miss any step and backers are refunded in full.</p></div>
        </Rv>
      </div>
    </>
  );
}
