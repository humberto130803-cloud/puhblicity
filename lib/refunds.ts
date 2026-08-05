import { mustDb } from "@/lib/db";
import { MEMO } from "@/lib/config";
import { transition, logAction } from "@/lib/state";
import { findVaultTxByMemo, sendFromVault, TxNeverLanded } from "@/lib/vault";

const MAX_ATTEMPTS = 5;
const STALE_SENDING_MS = 3 * 60_000;

/**
 * The refund worker. Spec §7.4 — built before the pretty pages.
 *
 * Full pledged amount back, always; the platform absorbs the network fee.
 * A partial refund reads as theft.
 *
 * Idempotency: a pledge is atomically CLAIMED (DUE → SENDING via a
 * conditional update) before anything is signed. Every refund tx carries the
 * memo PUHB:REFUND:<pledge sig>, so a worker that died mid-send can look the
 * truth up on-chain instead of guessing — a double-send on Solana has no
 * clawback.
 */
export async function runRefundWorker(maxBatch = 8): Promise<{ sent: number; failed: number }> {
  const db = mustDb();
  let sent = 0;
  let failed = 0;

  // 1. Recover stale SENDING claims (worker died mid-send).
  const staleCutoff = new Date(Date.now() - STALE_SENDING_MS).toISOString();
  const { data: stale } = await db
    .from("puhb_pledges")
    .select("*")
    .eq("refund_status", "SENDING")
    .lt("refund_claimed_at", staleCutoff)
    .limit(20);

  for (const p of stale ?? []) {
    const onChain = await findVaultTxByMemo(MEMO.refund(p.signature));
    if (onChain) {
      await db
        .from("puhb_pledges")
        .update({ refund_status: "SENT", refund_signature: onChain })
        .eq("signature", p.signature)
        .eq("refund_status", "SENDING");
      sent++;
    } else {
      const attempts = (p.refund_attempts ?? 0) + 1;
      const next = attempts >= MAX_ATTEMPTS ? "FAILED" : "DUE";
      await db
        .from("puhb_pledges")
        .update({ refund_status: next, refund_attempts: attempts })
        .eq("signature", p.signature)
        .eq("refund_status", "SENDING");
      if (next === "FAILED") {
        failed++;
        await logAction("system", "refund_failed", p.dare_id, { pledge: p.signature });
      }
    }
  }

  // 2. Send fresh DUE refunds.
  const { data: due } = await db
    .from("puhb_pledges")
    .select("*")
    .eq("refund_status", "DUE")
    .lt("refund_attempts", MAX_ATTEMPTS)
    .order("credited_at", { ascending: true })
    .limit(maxBatch);

  for (const p of due ?? []) {
    // Claim atomically — only one worker wins this row.
    const { data: claimed } = await db
      .from("puhb_pledges")
      .update({ refund_status: "SENDING", refund_claimed_at: new Date().toISOString() })
      .eq("signature", p.signature)
      .eq("refund_status", "DUE")
      .select("signature");
    if (!claimed || claimed.length === 0) continue;

    try {
      const sig = await sendFromVault(
        p.backer_wallet,
        BigInt(p.lamports),
        MEMO.refund(p.signature)
      );
      await db
        .from("puhb_pledges")
        .update({ refund_status: "SENT", refund_signature: sig })
        .eq("signature", p.signature);
      sent++;
    } catch (e) {
      if (e instanceof TxNeverLanded) {
        // Chain says nothing moved — safe to put back in the queue.
        const attempts = (p.refund_attempts ?? 0) + 1;
        const next = attempts >= MAX_ATTEMPTS ? "FAILED" : "DUE";
        await db
          .from("puhb_pledges")
          .update({ refund_status: next, refund_attempts: attempts })
          .eq("signature", p.signature)
          .eq("refund_status", "SENDING");
        if (next === "FAILED") {
          failed++;
          await logAction("system", "refund_failed", p.dare_id, { pledge: p.signature });
        }
      }
      // Unknown outcome: LEAVE it SENDING. The stale-claim recovery above
      // will consult the chain next run. Never blind-retry an unknown.
    }
  }

  // 3. Dares with nothing left owed become REFUNDED.
  const { data: refunding } = await db
    .from("puhb_dares")
    .select("id")
    .eq("status", "REFUNDING");
  for (const d of refunding ?? []) {
    const { count } = await db
      .from("puhb_pledges")
      .select("*", { count: "exact", head: true })
      .eq("dare_id", d.id)
      .in("refund_status", ["DUE", "SENDING", "FAILED"]);
    if (count === 0) {
      await transition(d.id, "REFUNDING", "REFUNDED", "system", {
        settled_at: new Date().toISOString(),
      });
    }
  }

  return { sent, failed };
}
