import { after } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";
import { sweepDeadlines, recoverPayouts } from "@/lib/settle";
import { runIndexer } from "@/lib/indexer";
import { runRefundWorker } from "@/lib/refunds";

/**
 * Opportunistic heartbeat: page traffic keeps settlement near-real-time
 * between external cron hits (GitHub Actions runs at best every ~5 minutes).
 * Gated through the durable rate limiter so a traffic spike runs at most one
 * tick per 45s across the whole fleet, and runs in after() so no visitor
 * ever waits on it. Every worker inside is claim-guarded, so an overlap with
 * the external cron is harmless.
 */
export function maybeTick(): void {
  after(async () => {
    try {
      if (!(await checkRateLimit("opportunistic-tick", 1, 45_000))) return;
      await sweepDeadlines();
      await runIndexer();
      await runRefundWorker();
      await recoverPayouts();
    } catch {
      // Next scheduled tick catches up.
    }
  });
}
