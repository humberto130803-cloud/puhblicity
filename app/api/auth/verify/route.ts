import { cookies } from "next/headers";
import {
  parseSignInMessage,
  verifyMessageSignature,
} from "@solana/wallet-standard-util";
import bs58 from "bs58";
import { createSession } from "@/lib/session";
import { NONCE_COOKIE, SIWS_STATEMENT, type VerifyPayload } from "@/lib/siws";

function bad(status: number, error: string) {
  return Response.json({ error }, { status });
}

/**
 * Verifies a Sign-In-With-Solana response and opens a session.
 *
 * We deliberately do NOT use `verifySignIn()` from wallet-standard-util.
 * That helper re-derives the message from the challenge we sent and requires
 * every field to match what was signed — including `uri` and `chainId`,
 * which wallets add on their own. Phantom does exactly that, so sign-in
 * failed for every user with a valid signature, and it failed on a field
 * comparison before any cryptography ran.
 *
 * Instead: verify the signature over the bytes the wallet actually signed,
 * then parse those bytes and enforce the four things we care about. Extra
 * fields a wallet chose to include are ignored — they can't weaken a
 * signature we've already verified.
 */
export async function POST(request: Request) {
  let payload: VerifyPayload;
  try {
    payload = await request.json();
  } catch {
    return bad(400, "Invalid JSON body");
  }

  const { account, signature, signedMessage } = payload;
  if (!account || !signature || !signedMessage) {
    return bad(400, "Missing fields");
  }

  const store = await cookies();
  const expectedNonce = store.get(NONCE_COOKIE)?.value;
  if (!expectedNonce) {
    return bad(401, "That sign-in request expired. Tap connect and try again.");
  }

  let publicKey: Uint8Array;
  let sigBytes: Uint8Array;
  let msgBytes: Uint8Array;
  try {
    publicKey = bs58.decode(account);
    sigBytes = bs58.decode(signature);
    msgBytes = bs58.decode(signedMessage);
  } catch {
    return bad(400, "Invalid base58 encoding");
  }
  if (publicKey.length !== 32) return bad(400, "Invalid public key");
  if (sigBytes.length !== 64) return bad(400, "Invalid signature length");

  // 1. The cryptography: did this key sign these exact bytes?
  let signatureValid = false;
  try {
    signatureValid = verifyMessageSignature({
      message: msgBytes,
      signedMessage: msgBytes,
      signature: sigBytes,
      publicKey,
    });
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) return bad(401, "Signature verification failed");

  // 2. What did they actually sign?
  const parsed = parseSignInMessage(msgBytes);
  if (!parsed) return bad(400, "Could not read the signed message");

  // 3. Our four requirements.
  const host = new URL(request.url).host;
  if (parsed.domain !== host) {
    // Anti-phishing: a signature farmed on another site is useless here.
    return bad(401, "This signature was made for a different site");
  }
  if (parsed.nonce !== expectedNonce) {
    // Replay protection: it must answer the challenge we just issued.
    return bad(401, "Sign-in challenge mismatch — try again");
  }
  if ((parsed.statement ?? "").trim() !== SIWS_STATEMENT.trim()) {
    return bad(401, "The signed terms don't match ours");
  }
  if (parsed.address !== account) {
    return bad(401, "Signed by a different wallet than the one claimed");
  }

  // Challenge consumed — burn the nonce and open the session.
  store.delete(NONCE_COOKIE);
  await createSession(account);

  return Response.json({ ok: true, pubkey: account });
}
