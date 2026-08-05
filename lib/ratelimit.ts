/**
 * Rate limiter, ported from Ascending. Backends in order: shared KV if
 * configured, Postgres rl_hit() (already present in this shared Supabase
 * project), in-memory per-instance as last resort.
 */
import { serviceDb } from "@/lib/db";

const KV_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

async function kv(...parts: string[]): Promise<number> {
  const res = await fetch(`${KV_URL}/${parts.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`kv ${res.status}`);
  const body = (await res.json()) as { result: number };
  return body.result;
}

const buckets = new Map<string, number[]>();
function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return true;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  if (KV_URL && KV_TOKEN) {
    try {
      const window = Math.floor(Date.now() / windowMs);
      const k = `rl:puhb:${key}:${window}`;
      const count = await kv("incr", k);
      if (count === 1) await kv("pexpire", k, String(windowMs));
      return count <= limit;
    } catch {
      // fall through
    }
  }
  const db = serviceDb();
  if (db) {
    try {
      const { data, error } = await db.rpc("rl_hit", {
        p_key: `puhb:${key}`,
        p_limit: limit,
        p_window_ms: windowMs,
      });
      if (!error && typeof data === "boolean") return data;
    } catch {
      // fall through
    }
  }
  return memoryRateLimit(key, limit, windowMs);
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
