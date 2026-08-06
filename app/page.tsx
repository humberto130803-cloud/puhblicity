import Link from "next/link";
import { listBoardDares, getSettings } from "@/lib/dares";
import { siteStats } from "@/lib/stats";
import { formatSol, padSol } from "@/lib/format";
import { Board } from "@/components/board";
import { Tote, Therm } from "@/components/tote";
import { Tape, Floaters, Marquee } from "@/components/hero-fx";
import { Rv } from "@/components/reveal";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { locale, t } = await getT();
  const [dares, settings, stats] = await Promise.all([
    listBoardDares(locale),
    getSettings(),
    siteStats(locale),
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
                <i></i> {t.home.live(stats.openCount, formatSol(stats.openPot))}
              </Rv>
              <Rv as="h1" className="h1" style={{ marginTop: 18 }}>
                <span className="line"><i>{t.home.h1a}</i></span>
                <span className="line"><i>{t.home.h1b}</i></span>
                <span className="line"><i>{t.home.h1c}</i></span>
              </Rv>
              <Rv as="p" className="hero-sub" index={1}>
                {t.home.sub}
              </Rv>
              <Rv className="hero-cta" index={2}>
                <Link className="btn btn-primary" href="/create">
                  <span>{t.home.post}</span><span className="arrow">→</span>
                </Link>
                <a className="btn on-dark-btn" href="#board">
                  <span>{t.home.seeOpen}</span>
                </a>
              </Rv>
              <Rv className="hero-rules" index={3}>
                <div><b>{t.home.rule1t}</b>{t.home.rule1b}</div>
                <div><b>{t.home.rule2t}</b>{t.home.rule2b}</div>
                <div><b>{t.home.rule3t}</b>{t.home.rule3b}</div>
              </Rv>
            </div>

            <Rv className="hero-tote on-field" index={1}>
              <p className="eyebrow">{t.home.paidSoFar}</p>
              <Tote
                value={padSol(stats.paidOutTotal)}
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
                <span>{t.home.daresDone(stats.paidCount)}</span>
                <span>{t.home.openNow(stats.openCount)}</span>
              </div>
            </Rv>
          </div>
        </div>
        <div className="scrollcue"><i></i> {t.home.scroll}</div>
      </div>

      <Marquee items={stats.marquee} />

      {settings.paused && (
        <div className="wrap" style={{ paddingTop: 24 }}>
          <div className="notice" role="alert">
            <b>{t.home.pausedTitle}</b> {t.home.paused}
          </div>
        </div>
      )}

      <Board dares={dares} />

      <div className="wrap section" style={{ paddingTop: 0 }}>
        <Rv as="p" className="eyebrow" style={{ marginBottom: 16 }}>
          {t.home.stepsEyebrow}
        </Rv>
        <Rv className="steps">
          {t.home.steps.map((s, i) => (
            <div className="step" key={i}>
              <u>{String(i + 1).padStart(2, "0")}</u>
              <b>{s.t}</b>
              <p>{s.b}</p>
            </div>
          ))}
        </Rv>
      </div>
    </>
  );
}
