/**
 * Every product constant in one place. Import from here — never hardcode a
 * lamport amount, window, or cap at a call site.
 *
 * All monetary values are bigint lamports, end to end. The UI converts to a
 * display string only at the last moment via formatSol().
 */
export const CONFIG = {
  POSTING_FEE_LAMPORTS:      20_000_000n,   // 0.02 SOL
  MIN_PLEDGE_LAMPORTS:       50_000_000n,   // 0.05 SOL — above dust, keeps refunds economical
  MIN_TARGET_LAMPORTS:      250_000_000n,   // 0.25 SOL
  CEILING_LAMPORTS:       5_000_000_000n,   // 5 SOL — hard cap, invariant #2
  PLATFORM_CUT_BPS:                 1_000n, // 10.00%
  FUNDING_WINDOWS_HOURS:       [24, 72, 168],
  PROOF_WINDOW_HOURS:                  48,
  REVIEW_WINDOW_HOURS:                 24,
  MAX_LIVE_DARES_PER_WALLET:            3,
  MAX_PROOF_BYTES:             50_000_000,  // 50 MB — Supabase free-tier object cap
  MAX_PROOF_SECONDS:                   90,
} as const;

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.mainnet-beta.solana.com";

/** Vault pubkey — public by design (backers pay into it). */
export const VAULT_PUBKEY = process.env.NEXT_PUBLIC_VAULT_PUBKEY ?? "";

export type DareStatus =
  | "OPEN"
  | "CLOSED"
  | "IN_REVIEW"
  | "PAID"
  | "REFUNDING"
  | "REFUNDED"
  | "KILLED";

/** Memo tags. Everything the platform writes on-chain is greppable by prefix. */
export const MEMO = {
  newDare: (nonce: string) => `PUHB:NEW:${nonce}`,
  pledge: (dareId: string) => `PUHB:${dareId}`,
  refund: (pledgeSig: string) => `PUHB:REFUND:${pledgeSig.slice(0, 32)}`,
  payout: (dareId: string) => `PUHB:PAYOUT:${dareId}`,
} as const;
