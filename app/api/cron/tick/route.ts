import { sweepDeadlines, recoverPayouts, expireProofs } from "@/lib/settle";
import { runIndexer } from "@/lib/indexer";
import { runRefundWorker } from "@/lib/refunds";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The heartbeat. An external cron hits this every minute with the secret.
 * Order matters: deadlines first (marks refunds DUE), then the indexer
 * (credits anything new, may close a dare), then refunds, then payout
 * recovery. Every operation inside is claim-guarded, so overlapping ticks
 * are safe.
 */
async function tick(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const secret =
    request.headers.get("x-cron-secret") ?? url.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const out: Record<string, unknown> = {};
  const errors: string[] = [];

  try {
    out.deadlines = await sweepDeadlines();
  } catch (e) {
    errors.push(`sweep: ${String(e)}`);
  }
  try {
    out.indexer = await runIndexer();
  } catch (e) {
    errors.push(`indexer: ${String(e)}`);
  }
  try {
    out.refunds = await runRefundWorker();
  } catch (e) {
    errors.push(`refunds: ${String(e)}`);
  }
  try {
    out.payouts = await recoverPayouts();
  } catch (e) {
    errors.push(`payouts: ${String(e)}`);
  }
  try {
    out.proofsExpired = await expireProofs();
  } catch (e) {
    errors.push(`proofs: ${String(e)}`);
  }

  return Response.json({ ok: errors.length === 0, ...out, errors });
}

export async function GET(request: Request) {
  return tick(request);
}
export async function POST(request: Request) {
  return tick(request);
}
