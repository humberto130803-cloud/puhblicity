import { mustDb } from "@/lib/db";
import { computePayout } from "@/lib/settle";
import { formatSol } from "@/lib/format";

export type SiteStats = {
  openCount: number;
  openPot: bigint;
  paidCount: number;
  paidOutTotal: bigint;
  marquee: string[];
};

/** Everything the hero and marquee need, in one sweep. */
export async function siteStats(): Promise<SiteStats> {
  const db = mustDb();
  const { data } = await db
    .from("puhb_dares")
    .select("id, doer_name, status, pot_lamports, target_lamports, flagged, created_at, puhb_categories(label)")
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
    const label = (d.puhb_categories as any)?.label ?? "a dare";
    if (d.status === "OPEN" && !d.flagged) {
      openCount++;
      openPot += pot;
      if (pot > 0n && marquee.length < 10) {
        const pct = Math.round((Number(pot) / Number(target)) * 100);
        marquee.push(`${d.doer_name} is ${pct}% of the way there`);
      } else if (marquee.length < 10) {
        marquee.push(`New — ${label}`);
      }
    }
    if (d.status === "CLOSED" || d.status === "IN_REVIEW") {
      openPot += pot;
      if (marquee.length < 10) marquee.push(`${d.doer_name} hit target · ${formatSol(pot)} SOL`);
    }
    if (d.status === "PAID") {
      paidCount++;
      const { payout } = computePayout(pot);
      paidOutTotal += payout;
      if (marquee.length < 10) marquee.push(`${d.doer_name} paid out · ${formatSol(payout)} SOL`);
    }
    if (d.status === "REFUNDED" && marquee.length < 10) {
      marquee.push(`Refunded in full · ${label}`);
    }
  }

  // Evergreen lines keep the ticker alive on a young board.
  marquee.push("Ceiling raised? No. Still 5.");
  marquee.push("Miss the target and everyone's refunded — all of it");
  marquee.push("0.02 SOL to post · somebody has to go first");

  return { openCount, openPot, paidCount, paidOutTotal, marquee };
}
