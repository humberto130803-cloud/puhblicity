import { mustDb } from "@/lib/db";
import type { DareStatus } from "@/lib/config";

/**
 * The seven-state machine from the spec, §5. Every transition goes through
 * here: a conditional UPDATE guarded on the expected current status, so two
 * concurrent workers cannot double-transition, plus an admin_log row.
 *
 * Returns true if the transition happened, false if the guard failed
 * (someone else got there first, or the dare was in a different state).
 */
export async function transition(
  dareId: string,
  from: DareStatus | DareStatus[],
  to: DareStatus,
  actor: string,
  extra: Record<string, unknown> = {},
  logDetail: Record<string, unknown> = {}
): Promise<boolean> {
  const db = mustDb();
  const fromList = Array.isArray(from) ? from : [from];

  const { data, error } = await db
    .from("puhb_dares")
    .update({ status: to, ...extra })
    .eq("id", dareId)
    .in("status", fromList)
    .select("id");

  if (error) throw new Error(`transition ${dareId} → ${to}: ${error.message}`);
  if (!data || data.length === 0) return false;

  await db.from("puhb_admin_log").insert({
    actor,
    action: `transition:${fromList.join("|")}->${to}`,
    dare_id: dareId,
    detail: logDetail,
  });
  return true;
}

/**
 * Send a dare to REFUNDING and mark every un-refunded pledge DUE.
 * Used by: funding deadline miss, proof deadline miss, review timeout,
 * admin reject, admin kill (KILLED behaves identically for the money).
 */
export async function startRefunding(
  dareId: string,
  from: DareStatus | DareStatus[],
  actor: string,
  reason: string,
  finalStatus: "REFUNDING" | "KILLED" = "REFUNDING"
): Promise<boolean> {
  const db = mustDb();
  const ok = await transition(
    dareId,
    from,
    finalStatus,
    actor,
    finalStatus === "REFUNDING" ? {} : {},
    { reason }
  );
  if (!ok) return false;

  const { error } = await db
    .from("puhb_pledges")
    .update({ refund_status: "DUE" })
    .eq("dare_id", dareId)
    .eq("refund_status", "NONE");
  if (error) throw new Error(`mark refunds due ${dareId}: ${error.message}`);
  return true;
}

/** Write an admin_log row outside a transition. */
export async function logAction(
  actor: string,
  action: string,
  dareId: string | null,
  detail: Record<string, unknown> = {}
): Promise<void> {
  await mustDb().from("puhb_admin_log").insert({
    actor,
    action,
    dare_id: dareId,
    detail,
  });
}
