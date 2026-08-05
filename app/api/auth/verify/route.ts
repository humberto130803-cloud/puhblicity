import { cookies } from "next/headers";
import { verifySignIn } from "@solana/wallet-standard-util";
import type { SolanaSignInOutput } from "@solana/wallet-standard-features";
import bs58 from "bs58";
import { createSession } from "@/lib/session";
import { NONCE_COOKIE, SIWS_STATEMENT, type VerifyPayload } from "@/lib/siws";

function bad(status: number, error: string) {
  return Response.json({ error }, { status });
}

/**
 * Verifies a Sign-In-With-Solana response and opens a session.
 * Checks, in order: nonce matches our httpOnly cookie, domain matches this
 * host, statement matches our Terms text exactly, ed25519 signature verifies.
 */
export async function POST(request: Request) {
  let payload: VerifyPayload;
  try {
    payload = await request.json();
  } catch {
    return bad(400, "Invalid JSON body");
  }

  const { input, account, signature, signedMessage } = payload;
  if (!input || !account || !signature || !signedMessage) {
    return bad(400, "Missing fields");
  }

  const store = await cookies();
  const expectedNonce = store.get(NONCE_COOKIE)?.value;
  if (!expectedNonce) return bad(401, "Nonce expired — try again");
  if (input.nonce !== expectedNonce) return bad(401, "Nonce mismatch");

  const host = new URL(request.url).host;
  if (input.domain !== host) return bad(401, "Domain mismatch");
  if (input.statement !== SIWS_STATEMENT) return bad(401, "Statement mismatch");
  if (input.address && input.address !== account) {
    return bad(401, "Address mismatch");
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

  const output: SolanaSignInOutput = {
    account: {
      address: account,
      publicKey,
      chains: [],
      features: [],
    },
    signature: sigBytes,
    signedMessage: msgBytes,
  };

  let verified = false;
  try {
    verified = verifySignIn(input, output);
  } catch {
    verified = false;
  }
  if (!verified) return bad(401, "Signature verification failed");

  store.delete(NONCE_COOKIE);
  await createSession(account);

  return Response.json({ ok: true, pubkey: account });
}
