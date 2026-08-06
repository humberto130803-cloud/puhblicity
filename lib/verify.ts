import { PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js";
import { rpc } from "@/lib/rpc";
import { CONFIG, MEMO, VAULT_PUBKEY } from "@/lib/config";
import { msg } from "@/lib/i18n/errors";
import type { Locale } from "@/lib/i18n/types";

/**
 * Server-side transaction verification. NEVER trust a client-reported
 * payment — a client that says "I paid" is a client that can lie. Every
 * check here reads the chain itself.
 */

export type VaultCredit = {
  /** Net lamports the vault gained in this tx (balance delta, not ix parsing —
   *  robust against multi-instruction transactions). */
  lamports: bigint;
  /** Fee payer / first signer — who we treat as the sender. */
  from: string;
  memo: string | null;
};

export async function getParsedTx(
  signature: string
): Promise<ParsedTransactionWithMeta | null> {
  return rpc().getParsedTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
}

export function extractVaultCredit(
  tx: ParsedTransactionWithMeta,
  vault: string = VAULT_PUBKEY
): VaultCredit | null {
  if (!tx.meta || tx.meta.err) return null;
  const keys = tx.transaction.message.accountKeys;
  const idx = keys.findIndex((k) => k.pubkey.toBase58() === vault);
  if (idx < 0) return null;
  const lamports =
    BigInt(tx.meta.postBalances[idx]) - BigInt(tx.meta.preBalances[idx]);
  const from = keys.find((k) => k.signer)?.pubkey.toBase58() ?? "";

  let memo: string | null = null;
  for (const ix of tx.transaction.message.instructions) {
    if ("program" in ix && ix.program === "spl-memo") {
      memo = typeof ix.parsed === "string" ? ix.parsed : null;
    }
  }
  return { lamports, from, memo };
}

/**
 * Verify a posting-fee transaction: confirmed on-chain, paid to the vault,
 * exactly the fee, carrying our nonce memo. Signature uniqueness is enforced
 * by the DB unique index on posting_fee_sig at insert time.
 *
 * The client posts right after its own confirmation, so the tx can lag our
 * RPC view by a beat — retry briefly before giving up.
 */
export async function verifyPostingFee(
  signature: string,
  nonce: string,
  locale: Locale = "en"
): Promise<{ ok: true; payer: string } | { ok: false; error: string }> {
  let tx: ParsedTransactionWithMeta | null = null;
  for (let i = 0; i < 4 && !tx; i++) {
    tx = await getParsedTx(signature);
    if (!tx) await new Promise((r) => setTimeout(r, 1500));
  }
  if (!tx) return { ok: false, error: msg("txNotFound", locale) };
  const credit = extractVaultCredit(tx);
  if (!credit) return { ok: false, error: msg("txFailed", locale) };
  if (credit.lamports !== CONFIG.POSTING_FEE_LAMPORTS) {
    return { ok: false, error: msg("notTheFee", locale) };
  }
  if (credit.memo !== MEMO.newDare(nonce)) {
    return { ok: false, error: msg("feeMismatch", locale) };
  }
  if (!credit.from) return { ok: false, error: msg("noPayer", locale) };
  return { ok: true, payer: credit.from };
}

/** Parse a memo into a pledge dare ID, or null. */
export function pledgeMemoDareId(memo: string | null): string | null {
  if (!memo) return null;
  const m = memo.match(/^PUHB:([0-9A-HJKMNP-TV-Z]{8})$/);
  return m ? m[1] : null;
}

export const isFeeMemoFormat = (memo: string | null) =>
  !!memo && memo.startsWith("PUHB:NEW:");

export function vaultPublicKey(): PublicKey {
  if (!VAULT_PUBKEY) throw new Error("NEXT_PUBLIC_VAULT_PUBKEY not set");
  return new PublicKey(VAULT_PUBKEY);
}
