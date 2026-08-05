import { processVaultTx } from "@/lib/indexer";
import { isLikelySignature } from "@/lib/rpc";
import { checkPublicText } from "@/lib/text-safety";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

/**
 * The client tells us "my pledge tx just confirmed" so the pot updates
 * instantly instead of on the next indexer tick. We verify everything
 * on-chain ourselves — this is a hint, not a claim we trust. The cron
 * indexer remains the source of truth and catches anything this misses.
 */
export async function POST(request: Request) {
  if (!(await checkRateLimit(`notify:${clientIp(request)}`, 30, 60_000))) {
    return Response.json({ error: "Slow down" }, { status: 429 });
  }

  let body: { signature?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isLikelySignature(body.signature)) {
    return Response.json({ error: "Bad signature" }, { status: 400 });
  }

  let note: string | null = null;
  if (typeof body.note === "string" && body.note.trim()) {
    const check = checkPublicText(body.note, 80, null);
    // A bad note doesn't block the money — the pledge credits without it.
    if (check.ok && check.value) note = check.value;
  }

  try {
    const result = await processVaultTx(body.signature, note);
    return Response.json({ ok: true, credited: result === "credited" });
  } catch {
    // The cron indexer will pick it up; tell the client the truth.
    return Response.json({ ok: true, credited: false, deferred: true });
  }
}
