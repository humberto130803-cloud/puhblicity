import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type Connection,
} from "@solana/web3.js";
import { rpc } from "@/lib/rpc";

/**
 * The platform vault. SERVER ONLY — this module reads VAULT_SECRET_KEY.
 * Nothing under app/ that ships to the client may import it.
 */

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

let _kp: Keypair | null = null;
export function vaultKeypair(): Keypair {
  if (_kp) return _kp;
  const raw = process.env.VAULT_SECRET_KEY;
  if (!raw) throw new Error("VAULT_SECRET_KEY not set");
  _kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
  return _kp;
}

export function memoInstruction(text: string): TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(text, "utf8"),
  });
}

/** Thrown when a tx expired AND the chain confirms it never landed. */
export class TxNeverLanded extends Error {
  constructor() {
    super("expired-never-landed");
  }
}

/**
 * Confirm a transaction — and on expiry, CHECK before declaring failure.
 * Ported from Ascending (found live by the operator, 2026-07-22): expiry on a
 * flaky RPC is common for transactions that actually LANDED. Treating it as
 * failure means retrying a payment that already went through.
 */
export async function confirmOrVerify(
  connection: Connection,
  signature: string,
  latest: { blockhash: string; lastValidBlockHeight: number }
): Promise<void> {
  try {
    await connection.confirmTransaction({ signature, ...latest }, "confirmed");
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    if (!/expired|block height/i.test(msg)) throw e;
    const st = await connection.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    const s = st.value[0];
    const landed =
      !!s &&
      !s.err &&
      (s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized");
    if (landed) return;
    throw new TxNeverLanded();
  }
}

/**
 * Send lamports from the vault with a tagging memo. Returns the signature
 * once confirmed. Throws TxNeverLanded if the chain says nothing moved —
 * safe to retry. Any other throw means UNKNOWN: the caller must not blindly
 * retry; use findVaultTxByMemo() to learn the truth first.
 */
export async function sendFromVault(
  to: string,
  lamports: bigint,
  memoText: string
): Promise<string> {
  const conn = rpc();
  const kp = vaultKeypair();
  const tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
      fromPubkey: kp.publicKey,
      toPubkey: new PublicKey(to),
      lamports,
    })
  );
  tx.add(memoInstruction(memoText));

  const latest = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = latest.blockhash;
  tx.feePayer = kp.publicKey;
  tx.sign(kp);

  const sig = await conn.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
  });
  await confirmOrVerify(conn, sig, latest);
  return sig;
}

/**
 * Crash recovery: did the vault already send a tx carrying this memo?
 * Scans recent vault history (newest first). Returns the signature or null.
 */
export async function findVaultTxByMemo(
  memoText: string,
  limit = 200
): Promise<string | null> {
  const conn = rpc();
  const kp = vaultKeypair();
  const sigs = await conn.getSignaturesForAddress(kp.publicKey, { limit });
  for (const s of sigs) {
    if (s.err) continue;
    // getSignaturesForAddress surfaces the memo without a per-tx fetch.
    if (s.memo && s.memo.includes(memoText)) return s.signature;
  }
  return null;
}

/** Current vault balance in lamports. */
export async function vaultBalance(): Promise<bigint> {
  const conn = rpc();
  const bal = await conn.getBalance(vaultKeypair().publicKey, "confirmed");
  return BigInt(bal);
}
