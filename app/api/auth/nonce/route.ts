import { cookies } from "next/headers";
import {
  buildSignInInput,
  generateNonce,
  NONCE_COOKIE,
  NONCE_MAX_AGE,
} from "@/lib/siws";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

/**
 * Issues a fresh SIWS challenge. The nonce is stored in an httpOnly cookie
 * so /api/auth/verify can confirm the wallet signed *our* challenge.
 */
export async function POST(request: Request) {
  if (!(await checkRateLimit(`nonce:${clientIp(request)}`, 20, 60_000))) {
    return Response.json({ error: "Slow down" }, { status: 429 });
  }
  const nonce = generateNonce();
  const host = new URL(request.url).host;
  const input = buildSignInInput(host, nonce);

  const store = await cookies();
  store.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: NONCE_MAX_AGE,
    path: "/",
  });

  return Response.json(input);
}
