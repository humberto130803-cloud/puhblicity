"use client";

import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type Connection,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

/** Client-side memo instruction — mirrors lib/vault (which is server-only). */
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export function memoIx(text: string): TransactionInstruction {
  return new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(text, "utf8"),
  });
}

/**
 * Build, sign (user's wallet) and send a SOL transfer to the vault with a
 * tagging memo. Returns the signature after the chain confirms it.
 *
 * On confirmation-timeout we check the chain once before deciding: a landed
 * tx must NOT be reported as failed (the user would pay twice), a dead one
 * must NOT be reported as paid.
 */
export async function payVault(
  wallet: WalletContextState,
  connection: Connection,
  vault: string,
  lamports: bigint,
  memoText: string
): Promise<string> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Connect a wallet first");
  }
  const tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(vault),
      lamports,
    })
  );
  tx.add(memoIx(memoText));

  const latest = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = latest.blockhash;
  tx.feePayer = wallet.publicKey;

  const signature = await wallet.sendTransaction(tx, connection);

  try {
    await connection.confirmTransaction({ signature, ...latest }, "confirmed");
  } catch {
    const st = await connection.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    const s = st.value[0];
    const landed =
      !!s &&
      !s.err &&
      (s.confirmationStatus === "confirmed" ||
        s.confirmationStatus === "finalized");
    if (!landed) {
      throw new Error(
        "The transaction didn't land — nothing was spent. Try again."
      );
    }
  }
  return signature;
}
