import { mustDb } from "@/lib/db";
import { computePayout } from "@/lib/settle";
import { formatSol } from "@/lib/format";
import type { Locale } from "@/lib/i18n/types";

/** Marquee copy, per language. */
const TICKER = {
  en: {
    pct: (name: string, pct: number) => `${name} is ${pct}% of the way there`,
    fresh: (label: string) => `New — ${label}`,
    hit: (name: string, sol: string) => `${name} hit target · ${sol} SOL`,
    paid: (name: string, sol: string) => `${name} paid out · ${sol} SOL`,
    refunded: (label: string) => `Refunded in full · ${label}`,
    evergreen: [
      "Ceiling raised? No. Still 5.",
      "Miss the target and everyone's refunded — all of it",
      "0.02 SOL to post · somebody has to go first",
    ],
  },
  es: {
    pct: (name: string, pct: number) => `${name} va en ${pct}% de su meta`,
    fresh: (label: string) => `Nuevo — ${label}`,
    hit: (name: string, sol: string) => `${name} llegó a la meta · ${sol} SOL`,
    paid: (name: string, sol: string) => `${name} cobró · ${sol} SOL`,
    refunded: (label: string) => `Reembolsado completo · ${label}`,
    evergreen: [
      "¿Subimos el tope? No. Sigue en 5.",
      "Si no se llega a la meta, todos recuperan su SOL — completo",
      "0.02 SOL para publicar · alguien tiene que ser el primero",
    ],
  },
} as const;

export type SiteStats = {
  openCount: number;
  openPot: bigint;
  paidCount: number;
  paidOutTotal: bigint;
  marquee: string[];
};

/** Everything the hero and marquee need, in one sweep. */
export async function siteStats(locale: Locale = "en"): Promise<SiteStats> {
  const db = mustDb();
  const tx = TICKER[locale] ?? TICKER.en;
  const { data } = await db
    .from("puhb_dares")
    .select("id, doer_name, status, pot_lamports, target_lamports, flagged, created_at, puhb_categories(label, label_es)")
    .order("created_at", { ascending: false })
    .limit(200);

  let openCount = 0;
  let openPot = 0n;
  let paidCount = 0;
  let paidOutTotal = 0n;
  const marquee: string[] = [];

  for (const d of data ?? []) {
    const pot = BigInt(d.pot_lamports);
    const target = BigInt(d.target_lamports);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cat = d.puhb_categories as any;
    const label = (locale === "es" ? cat?.label_es || cat?.label : cat?.label) ?? "";
    if (d.status === "OPEN" && !d.flagged) {
      openCount++;
      openPot += pot;
      if (pot > 0n && marquee.length < 10) {
        const pct = Math.round((Number(pot) / Number(target)) * 100);
        marquee.push(tx.pct(d.doer_name, pct));
      } else if (marquee.length < 10) {
        marquee.push(tx.fresh(label));
      }
    }
    if (d.status === "CLOSED" || d.status === "IN_REVIEW") {
      openPot += pot;
      if (marquee.length < 10) marquee.push(tx.hit(d.doer_name, formatSol(pot)));
    }
    if (d.status === "PAID") {
      paidCount++;
      const { payout } = computePayout(pot);
      paidOutTotal += payout;
      if (marquee.length < 10) marquee.push(tx.paid(d.doer_name, formatSol(payout)));
    }
    if (d.status === "REFUNDED" && marquee.length < 10) {
      marquee.push(tx.refunded(label));
    }
  }

  // Evergreen lines keep the ticker alive on a young board.
  marquee.push(...tx.evergreen);

  return { openCount, openPot, paidCount, paidOutTotal, marquee };
}
