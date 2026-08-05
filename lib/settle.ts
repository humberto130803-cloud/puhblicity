import { mustDb } from "@/lib/db";
import { CONFIG, MEMO } from "@/lib/config";
import { transition, logAction, startRefunding } from "@/lib/state";
import { findVaultTxByMemo, sendFromVault, TxNeverLanded } from "@/lib/vault";

const STALE_CLAIM_MS = 3 * 60_000;

export function computePayout(pot: bigint): { cut: bigint; payout: bigint } {
  const cut = (pot * CONFIG.PLATFORM_CUT_BPS) / 10_000n;
  return { cut, payout: pot - cut };
}

/**
 * Admin approved the proof: IN_REVIEW → PAID, then pay pot − 10% to the doer.
 * The transition claims the payout atomically (guarded on IN_REVIEW), so a
 * double-click or a second admin tab cannot double-pay. Every payout carries
 * memo PUHB:PAYOUT:<dareId>; if the send dies with an unknown outcome, the
 * recovery sweep consults the chain by memo before deciding to resend.
 */
export async function approveAndPay(
  dareId: string,
  actor: string
): Promise<{ ok: boolean; error?: string }> {
  const db = mustDb();
  const { data: dare } = await db
    .from("puhb_dares")
    .select("*")
    .eq("id", dareId)
    .single();
  if (!dare) return { ok: false, error: "No such dare" };
  if (dare.status !== "IN_REVIEW") return { ok: false, error: `Dare is ${dare.status}, not IN_REVIEW` };

  const ok = await transition(
    dareId,
    "IN_REVIEW",
    "PAID",
    actor,
    {
      settled_at: new Date().toISOString(),
      payout_claimed_at: new Date().toISOString(),
      // The proof goes public now and comes down automatically.
      proof_public_until: new Date(
        Date.now() + CONFIG.PROOF_PUBLIC_HOURS * 3600_000
      ).toISOString(),
    },
    { pot: dare.pot_lamports }
  );
  if (!ok) return { ok: false, error: "Someone else settled this dare first" };

  const { payout } = computePayout(BigInt(dare.pot_lamports));
  try {
    const sig = await sendFromVault(dare.doer_wallet, payout, MEMO.payout(dareId));
    await db.from("puhb_dares").update({ payout_signature: sig }).eq("id", dareId);
    await logAction(actor, "payout_sent", dareId, { payout: payout.toString(), sig });
  } catch (e) {
    if (e instanceof TxNeverLanded) {
      // Nothing moved — clear the claim so the recovery sweep resends.
      await db.from("puhb_dares").update({ payout_claimed_at: null }).eq("id", dareId);
    }
    // Unknown outcome: leave the claim; recovery consults the chain by memo.
    await logAction(actor, "payout_send_error", dareId, { error: String(e) });
  }
  return { ok: true };
}

/**
 * Recovery sweep for payouts that got claimed but never recorded a
 * signature. Runs every cron tick.
 */
export async function recoverPayouts(): Promise<number> {
  const db = mustDb();
  const cutoff = new Date(Date.now() - STALE_CLAIM_MS).toISOString();
  const { data: pending } = await db
    .from("puhb_dares")
    .select("*")
    .eq("status", "PAID")
    .is("payout_signature", null)
    .or(`payout_claimed_at.is.null,payout_claimed_at.lt.${cutoff}`)
    .limit(10);

  let recovered = 0;
  for (const dare of pending ?? []) {
    // Re-claim atomically so overlapping ticks can't both send.
    const { data: claimed } = await db
      .from("puhb_dares")
      .update({ payout_claimed_at: new Date().toISOString() })
      .eq("id", dare.id)
      .is("payout_signature", null)
      .or(`payout_claimed_at.is.null,payout_claimed_at.lt.${cutoff}`)
      .select("id");
    if (!claimed || claimed.length === 0) continue;

    const onChain = await findVaultTxByMemo(MEMO.payout(dare.id));
    if (onChain) {
      await db.from("puhb_dares").update({ payout_signature: onChain }).eq("id", dare.id);
      await logAction("system", "payout_recovered", dare.id, { sig: onChain });
      recovered++;
      continue;
    }
    const { payout } = computePayout(BigInt(dare.pot_lamports));
    try {
      const sig = await sendFromVault(dare.doer_wallet, payout, MEMO.payout(dare.id));
      await db.from("puhb_dares").update({ payout_signature: sig }).eq("id", dare.id);
      await logAction("system", "payout_resent", dare.id, { payout: payout.toString(), sig });
      recovered++;
    } catch (e) {
      await logAction("system", "payout_recovery_error", dare.id, { error: String(e) });
    }
  }
  return recovered;
}

/**
 * Take down proof videos whose public window has closed.
 *
 * The file is deleted outright — not hidden. Half the reason people agree to
 * be filmed at all is that it doesn't live online forever, and a promise to
 * delete that quietly resolves to "we stopped linking it" isn't a promise.
 * The dare, the outcome, the payout signature and the doer's note all stay.
 */
export async function expireProofs(): Promise<number> {
  const db = mustDb();
  const { data: due } = await db
    .from("puhb_dares")
    .select("id, proof_path")
    .not("proof_public_until", "is", null)
    .is("proof_deleted_at", null)
    .lt("proof_public_until", new Date().toISOString())
    .limit(25);

  let removed = 0;
  for (const d of due ?? []) {
    if (d.proof_path) {
      const { error } = await db.storage.from("puhb-proofs").remove([d.proof_path]);
      // A missing object is fine — it's already gone. Anything else, retry
      // on the next tick rather than marking it deleted when it isn't.
      if (error && !/not.?found/i.test(error.message)) continue;
    }
    await db
      .from("puhb_dares")
      .update({ proof_deleted_at: new Date().toISOString(), proof_path: null })
      .eq("id", d.id)
      .is("proof_deleted_at", null);
    await logAction("system", "proof_expired_deleted", d.id, {});
    removed++;
  }
  return removed;
}

/**
 * Deadline sweeps — the transitions the clock owns. Spec §5:
 *   OPEN      past funding_ends_at (still under target) → REFUNDING
 *   CLOSED    past proof_due_at with no proof           → REFUNDING
 *   IN_REVIEW past proof_submitted_at + 24h             → REFUNDING
 * The last one is the clause that protects backers from the operator being
 * asleep. Do not remove it.
 */
export async function sweepDeadlines(): Promise<number> {
  const db = mustDb();
  const nowIso = new Date().toISOString();
  let moved = 0;

  const { data: expired } = await db
    .from("puhb_dares")
    .select("id")
    .eq("status", "OPEN")
    .lt("funding_ends_at", nowIso);
  for (const d of expired ?? []) {
    if (await startRefunding(d.id, "OPEN", "system", "funding deadline passed under target")) moved++;
  }

  const { data: noProof } = await db
    .from("puhb_dares")
    .select("id")
    .eq("status", "CLOSED")
    .lt("proof_due_at", nowIso);
  for (const d of noProof ?? []) {
    if (await startRefunding(d.id, "CLOSED", "system", "proof window passed with no upload")) moved++;
  }

  const reviewCutoff = new Date(
    Date.now() - CONFIG.REVIEW_WINDOW_HOURS * 3600_000
  ).toISOString();
  const { data: unreviewed } = await db
    .from("puhb_dares")
    .select("id")
    .eq("status", "IN_REVIEW")
    .lt("proof_submitted_at", reviewCutoff);
  for (const d of unreviewed ?? []) {
    if (await startRefunding(d.id, "IN_REVIEW", "system", "admin missed the 24h review window — backers refunded")) moved++;
  }

  return moved;
}
