import { mustDb } from "@/lib/db";
import { rpc } from "@/lib/rpc";
import {
  extractVaultCredit,
  isFeeMemoFormat,
  pledgeMemoDareId,
  vaultPublicKey,
} from "@/lib/verify";

/**
 * The indexer is the source of truth for pledges, not the client. It walks
 * vault history newest→oldest until it reaches the stored cursor, then
 * processes oldest→newest, advancing the cursor after each item — so an RPC
 * outage mid-run resumes exactly where it stopped, and nothing is assumed
 * seen that wasn't.
 *
 * Idempotency lives in puhb_credit_pledge (insert ... on conflict do
 * nothing on the tx signature), so the poller, the pledge-notify route, and
 * any overlap between cron ticks are all harmless.
 */
export async function runIndexer(): Promise<{ processed: number; credited: number }> {
  const db = mustDb();
  const conn = rpc();
  const vault = vaultPublicKey();

  const { data: st } = await db
    .from("puhb_indexer_state")
    .select("last_processed_signature")
    .eq("id", 1)
    .single();
  const until = st?.last_processed_signature ?? undefined;

  // Page backwards until we reach the cursor (or history ends).
  const collected: { signature: string; err: unknown }[] = [];
  let before: string | undefined = undefined;
  for (let page = 0; page < 10; page++) {
    const sigs = await conn.getSignaturesForAddress(vault, { until, before, limit: 100 });
    if (sigs.length === 0) break;
    collected.push(...sigs.map((s) => ({ signature: s.signature, err: s.err })));
    if (sigs.length < 100) break;
    before = sigs[sigs.length - 1].signature;
  }

  // Oldest first.
  collected.reverse();

  let processed = 0;
  let credited = 0;
  for (const item of collected) {
    if (!item.err) {
      const wasCredit = await processVaultTx(item.signature);
      if (wasCredit) credited++;
    }
    // Advance the cursor after EVERY item (including failed txs) so a crash
    // never reprocesses what's done and never skips what isn't.
    await db
      .from("puhb_indexer_state")
      .update({ last_processed_signature: item.signature, updated_at: new Date().toISOString() })
      .eq("id", 1);
    processed++;
  }
  return { processed, credited };
}

/**
 * Process one vault transaction. Returns true if a pledge was credited.
 * Also usable directly by the pledge-notify route for instant crediting.
 */
export async function processVaultTx(
  signature: string,
  backerNote: string | null = null
): Promise<boolean> {
  const db = mustDb();
  const conn = rpc();

  const tx = await conn.getParsedTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!tx) return false;
  const credit = extractVaultCredit(tx);
  if (!credit) return false;

  // Outgoing (refunds, payouts) — recorded by their own workers. Ignore.
  if (credit.lamports <= 0n) return false;

  const dareId = pledgeMemoDareId(credit.memo);
  if (dareId) {
    const { data, error } = await db.rpc("puhb_credit_pledge", {
      p_signature: signature,
      p_dare_id: dareId,
      p_backer: credit.from,
      p_lamports: credit.lamports.toString(),
      p_note: backerNote,
    });
    if (error) throw new Error(`credit_pledge ${signature}: ${error.message}`);
    return data === "CREDITED" || data === "CLOSED" || data === "REFUND_DUE";
  }

  if (isFeeMemoFormat(credit.memo)) {
    // Posting fee. If a dare records this signature it's fully accounted for;
    // if not (the form died after payment), orphan-log it for manual review.
    const { data: dare } = await db
      .from("puhb_dares")
      .select("id")
      .eq("posting_fee_sig", signature)
      .maybeSingle();
    if (!dare) {
      await db.from("puhb_orphan_payments").upsert(
        {
          signature,
          from_wallet: credit.from,
          lamports: credit.lamports.toString(),
          memo: credit.memo,
          note: "posting fee with no dare — form may have died after payment",
        },
        { onConflict: "signature", ignoreDuplicates: true }
      );
    }
    return false;
  }

  // SOL with no matchable memo (exchange sends strip memos; SPL/NFT deposits
  // don't move SOL and never reach here). Never auto-credit. Log it.
  await db.from("puhb_orphan_payments").upsert(
    {
      signature,
      from_wallet: credit.from,
      lamports: credit.lamports.toString(),
      memo: credit.memo,
    },
    { onConflict: "signature", ignoreDuplicates: true }
  );
  return false;
}
