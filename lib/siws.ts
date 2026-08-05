import type { SolanaSignInInput } from "@solana/wallet-standard-features";

export const NONCE_COOKIE = "puhb_nonce";
export const NONCE_MAX_AGE = 60 * 10; // 10 minutes

// The message every user signs to prove wallet ownership when they sign in.
export const SIWS_STATEMENT =
  "Welcome to PUHBLICITY. By signing, you confirm ownership of this wallet, " +
  "that you are 18 or older, and that you agree to the Terms. We hold pledged " +
  "SOL in a platform vault until a dare settles — this is custodial, not a " +
  "smart contract. This signature does not authorize any transaction or move " +
  "any funds.";

/** Payload the client sends back to /api/auth/verify (all byte fields base58). */
export type VerifyPayload = {
  input: SolanaSignInInput;
  account: string; // base58 pubkey
  signature: string; // base58
  signedMessage: string; // base58
};

export function buildSignInInput(host: string, nonce: string): SolanaSignInInput {
  return {
    domain: host,
    statement: SIWS_STATEMENT,
    nonce,
    issuedAt: new Date().toISOString(),
    version: "1",
  };
}

export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // SIWS spec: nonce must be >= 8 alphanumeric characters.
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
