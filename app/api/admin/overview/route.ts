import { mustDb } from "@/lib/db";
import { getSession, isAdminPubkey } from "@/lib/session";
import { vaultBalance } from "@/lib/vault";
import { getSettings, toPublicDare } from "@/lib/dares";

export const dynamic = "force-dynamic";

/**
 * Everything the operator needs, in priority order (§9): proofs on the 24h
 * clock, flagged dares awaiting clearance, failed refunds, orphan payments,
 * vault balance vs. what's owed, and the pause switch.
 */
export async function GET() {
  const session = await getSession();
  if (!session || !isAdminPubkey(session.pubkey)) {
    return Response.json({ error: "Not the admin" }, { status: 403 });
  }
  const db = mustDb();

  const [inReview, flagged, failedRefunds, orphans, settings, openPot] =
    await Promise.all([
      db
        .from("puhb_dares")
        .select("*, puhb_categories(label, emoji, blurb)")
        .eq("status", "IN_REVIEW")
        .order("proof_submitted_at", { ascending: true }),
      db
        .from("puhb_dares")
        .select("*, puhb_categories(label, emoji, blurb)")
        .eq("flagged", true)
        .in("status", ["OPEN", "CLOSED", "IN_REVIEW"])
        .order("created_at", { ascending: true }),
      db
        .from("puhb_pledges")
        .select("*")
        .eq("refund_status", "FAILED"),
      db
        .from("puhb_orphan_payments")
        .select("*")
        .eq("resolved", false)
        .order("seen_at", { ascending: false }),
      getSettings(),
      db.rpc("puhb_open_pot_total"),
    ]);

  let vault = "0";
  try {
    vault = (await vaultBalance()).toString();
  } catch {
    vault = "rpc-error";
  }

  // Full detail for the admin, including raw wallets — this is the operator.
  return Response.json({
    inReview: (inReview.data ?? []).map((d) => ({
      ...toPublicDare(d),
      doer_wallet: d.doer_wallet,
      proof_path: d.proof_path,
    })),
    flagged: (flagged.data ?? []).map((d) => ({
      ...toPublicDare(d),
      doer_wallet: d.doer_wallet,
    })),
    failedRefunds: failedRefunds.data ?? [],
    orphans: orphans.data ?? [],
    paused: settings.paused,
    maxTotalOpenPot: settings.max_total_open_pot,
    openPot: String(openPot.data ?? 0),
    vaultBalance: vault,
    vaultPubkey: settings.vault_pubkey,
  });
}
