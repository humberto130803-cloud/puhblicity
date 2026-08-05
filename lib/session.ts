import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "puhb_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = {
  pubkey: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set (min 32 chars)");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(pubkey: string): Promise<void> {
  const token = await new SignJWT({ pubkey })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.pubkey === "string"
      ? { pubkey: payload.pubkey }
      : null;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** True when the session belongs to the admin wallet. */
export function isAdminPubkey(pubkey: string | undefined | null): boolean {
  const admin = process.env.ADMIN_WALLET;
  return !!admin && !!pubkey && pubkey === admin;
}
