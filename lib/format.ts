/**
 * The ONE place lamports become text. Everything monetary is bigint until it
 * hits this file. Floating point never touches a SOL amount.
 */

const LAMPORTS_PER_SOL = 1_000_000_000n;

/**
 * "1.25", "0.05", "5" — full precision, trailing zeros trimmed. Never
 * scientific notation, never a float on the way here.
 */
export function formatSol(lamports: bigint): string {
  const neg = lamports < 0n;
  const abs = neg ? -lamports : lamports;
  const whole = abs / LAMPORTS_PER_SOL;
  const frac = abs % LAMPORTS_PER_SOL;
  let out = whole.toString();
  if (frac > 0n) {
    out += "." + frac.toString().padStart(9, "0").replace(/0+$/, "");
  }
  return (neg ? "−" : "") + out;
}

/** "1.25 SOL" */
export const formatSolUnit = (lamports: bigint) => `${formatSol(lamports)} SOL`;

/**
 * Parse a user-typed SOL string ("0.25") into lamports WITHOUT floats.
 * Returns null on anything that isn't a plain decimal number.
 */
export function parseSolToLamports(input: string): bigint | null {
  const m = input.trim().match(/^(\d+)(?:\.(\d{1,9}))?$/);
  if (!m) return null;
  const whole = BigInt(m[1]);
  const frac = m[2] ? BigInt(m[2].padEnd(9, "0")) : 0n;
  return whole * LAMPORTS_PER_SOL + frac;
}

/** Wallet, 4 + 4: "8sVa…FxQN". Monospace at the call site, always. */
export const shortWallet = (w: string) =>
  w && w.length > 10 ? `${w.slice(0, 4)}…${w.slice(-4)}` : (w ?? "");

/** Relative age: 12s · 3m · 4h · 2d. */
export function ago(t: string | number): string {
  const ms = typeof t === "number" ? t : new Date(t).getTime();
  if (!isFinite(ms)) return "";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** Time remaining until an ISO timestamp: "2d 4h", "3h 12m", "14m", "ended". */
export function remaining(until: string): string {
  const ms = new Date(until).getTime() - Date.now();
  if (!isFinite(ms) || ms <= 0) return "ended";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}
