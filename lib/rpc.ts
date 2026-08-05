import { Connection } from "@solana/web3.js";
import { RPC_URL } from "@/lib/config";

// Single Connection reused across requests in a warm lambda.
let _conn: Connection | null = null;
export function rpc(): Connection {
  if (!_conn) _conn = new Connection(process.env.RPC_URL ?? RPC_URL, "confirmed");
  return _conn;
}

/** Cheap base58 signature shape check — reject junk before spending an RPC call. */
export function isLikelySignature(sig: unknown): sig is string {
  return typeof sig === "string" && /^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(sig);
}

/** Cheap base58 pubkey shape check. */
export function isLikelyPubkey(s: unknown): s is string {
  return typeof s === "string" && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s);
}
