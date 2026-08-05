/**
 * End-to-end SIWS check against a running server.
 * Signs the challenge the way Phantom does — including the uri and chainId
 * fields it adds on its own — and confirms the server accepts it.
 *
 *   node siws-test.mjs http://localhost:3600
 */
import { Keypair } from "@solana/web3.js";
import { ed25519 } from "@noble/curves/ed25519";
import bs58 from "bs58";

const BASE = process.argv[2] ?? "http://localhost:3600";
const kp = Keypair.generate();
const address = kp.publicKey.toBase58();

const jar = new Map();
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
function absorb(res) {
  const set = res.headers.getSetCookie?.() ?? [];
  for (const c of set) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
}

// 1. Challenge
const nonceRes = await fetch(`${BASE}/api/auth/nonce`, { method: "POST" });
absorb(nonceRes);
const input = await nonceRes.json();

// 2. Build the message the way a wallet does — note the EXTRA fields
//    (URI, Chain ID) that Phantom inserts and the old code choked on.
function buildMessage(i, addr, extras) {
  const domain = extras.domainOverride ?? i.domain;
  const statement = extras.statementOverride ?? i.statement;
  let m = `${domain} wants you to sign in with your Solana account:\n${addr}`;
  if (statement) m += `\n\n${statement}`;
  const f = [];
  if (extras.uri) f.push(`URI: ${extras.uri}`);
  if (i.version) f.push(`Version: ${i.version}`);
  if (extras.chainId) f.push(`Chain ID: ${extras.chainId}`);
  if (i.nonce) f.push(`Nonce: ${i.nonce}`);
  if (i.issuedAt) f.push(`Issued At: ${i.issuedAt}`);
  if (f.length) m += `\n\n${f.join("\n")}`;
  return m;
}

async function attempt(label, extras) {
  const r0 = await fetch(`${BASE}/api/auth/nonce`, { method: "POST" });
  absorb(r0);
  const inp = await r0.json();
  const text = buildMessage(inp, address, extras);
  const bytes = new TextEncoder().encode(text);
  const sig = ed25519.sign(bytes, kp.secretKey.slice(0, 32));
  const res = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader() },
    body: JSON.stringify({
      input: inp,
      account: address,
      signature: bs58.encode(sig),
      signedMessage: bs58.encode(bytes),
    }),
  });
  absorb(res);
  const body = await res.json();
  console.log(`  ${label.padEnd(34)} ${res.status} ${JSON.stringify(body).slice(0, 80)}`);
  return res.ok;
}

console.log(`\n  wallet ${address}`);
console.log(`  domain ${input.domain}\n`);

const a = await attempt("Phantom-style (URI + Chain ID)", { uri: `https://${input.domain}`, chainId: "mainnet" });
const b = await attempt("bare message (no extras)", {});
await attempt("statement swapped for a fake one", {
  statementOverride: "I agree to give this website everything I own.",
});
await attempt("signed for a phishing domain", { domainOverride: "evil.example.com" });

// 3. A forged signature must still be rejected.
const r0 = await fetch(`${BASE}/api/auth/nonce`, { method: "POST" });
absorb(r0);
const inp = await r0.json();
const text = buildMessage(inp, address, { uri: `https://${inp.domain}`, chainId: "mainnet" });
const bytes = new TextEncoder().encode(text);
const other = Keypair.generate();
const badSig = ed25519.sign(bytes, other.secretKey.slice(0, 32));
const res = await fetch(`${BASE}/api/auth/verify`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookieHeader() },
  body: JSON.stringify({ input: inp, account: address, signature: bs58.encode(badSig), signedMessage: bs58.encode(bytes) }),
});
const body = await res.json();
console.log(`  ${"signature from another wallet".padEnd(34)} ${res.status} ${JSON.stringify(body).slice(0, 80)}`);

// 4. Replaying a stale nonce must fail.
const stale = await fetch(`${BASE}/api/auth/verify`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookieHeader() },
  body: JSON.stringify({ input, account: address, signature: bs58.encode(ed25519.sign(new TextEncoder().encode(buildMessage(input, address, {})), kp.secretKey.slice(0,32))), signedMessage: bs58.encode(new TextEncoder().encode(buildMessage(input, address, {}))) }),
});
console.log(`  ${"replayed old nonce".padEnd(34)} ${stale.status} ${JSON.stringify(await stale.json()).slice(0, 80)}`);

console.log(`\n  real sign-ins accepted: ${a && b}`);
