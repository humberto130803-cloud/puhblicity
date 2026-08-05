/**
 * Dare IDs: 8 chars, uppercase, Crockford-style base32 (no I, L, O, U — a
 * dare ID gets read aloud off a screenshot, so no ambiguous glyphs).
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function newDareId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % 32];
  return out;
}

export const isDareId = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9A-HJKMNP-TV-Z]{8}$/.test(s);

/** Client nonce for the posting-fee memo. */
export function newNonce(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
