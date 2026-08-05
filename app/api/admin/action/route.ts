import { mustDb } from "@/lib/db";
import { getSession, isAdminPubkey } from "@/lib/session";
import { startRefunding, logAction } from "@/lib/state";
import { approveAndPay } from "@/lib/settle";
import { isDareId } from "@/lib/ids";
import { isLikelySignature } from "@/lib/rpc";

function bad(status: number, error: string) {
  return Response.json({ error }, { status });
}

type Body = {
  action?: string;
  dareId?: string;
  reason?: string;
  paused?: boolean;
  pledgeSignature?: string;
  orphanSignature?: string;
};

/** Every admin action, one gate. The session is a signed-message login. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isAdminPubkey(session.pubkey)) {
    return bad(403, "Not the admin");
  }
  const actor = `admin:${session.pubkey.slice(0, 8)}`;

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return bad(400, "Invalid JSON");
  }
  const db = mustDb();

  switch (body.action) {
    case "pause":
    case "unpause": {
      const paused = body.action === "pause";
      const { error } = await db
        .from("puhb_settings")
        .update({ paused })
        .eq("id", 1);
      if (error) return bad(500, error.message);
      await logAction(actor, paused ? "paused" : "unpaused", null);
      return Response.json({ ok: true, paused });
    }

    case "clear_flag": {
      if (!isDareId(body.dareId)) return bad(400, "Bad dare id");
      const { error } = await db
        .from("puhb_dares")
        .update({ flagged: false })
        .eq("id", body.dareId);
      if (error) return bad(500, error.message);
      await logAction(actor, "flag_cleared", body.dareId);
      return Response.json({ ok: true });
    }

    case "approve": {
      if (!isDareId(body.dareId)) return bad(400, "Bad dare id");
      const res = await approveAndPay(body.dareId, actor);
      if (!res.ok) return bad(409, res.error ?? "Could not approve");
      return Response.json({ ok: true });
    }

    case "reject": {
      if (!isDareId(body.dareId)) return bad(400, "Bad dare id");
      const reason = (body.reason ?? "").trim();
      if (!reason) return bad(400, "Rejection requires a reason — the doer sees it.");
      const { error } = await db
        .from("puhb_dares")
        .update({ reject_reason: reason })
        .eq("id", body.dareId)
        .eq("status", "IN_REVIEW");
      if (error) return bad(500, error.message);
      const ok = await startRefunding(body.dareId, "IN_REVIEW", actor, `rejected: ${reason}`);
      if (!ok) return bad(409, "Dare is not in review");
      return Response.json({ ok: true });
    }

    case "kill": {
      if (!isDareId(body.dareId)) return bad(400, "Bad dare id");
      const reason = (body.reason ?? "").trim() || "removed by admin";
      const ok = await startRefunding(
        body.dareId,
        ["OPEN", "CLOSED", "IN_REVIEW", "REFUNDING"],
        actor,
        reason,
        "KILLED"
      );
      if (!ok) return bad(409, "Dare is already terminal");
      return Response.json({ ok: true });
    }

    case "manual_refund": {
      if (!isLikelySignature(body.pledgeSignature)) return bad(400, "Bad pledge signature");
      const { data, error } = await db.rpc("puhb_manual_refund", {
        p_signature: body.pledgeSignature,
      });
      if (error) return bad(500, error.message);
      if (data !== "OK") return bad(409, `Refund not possible: ${data}`);
      return Response.json({ ok: true });
    }

    case "retry_refund": {
      // FAILED → DUE with the attempt counter reset, after the operator
      // fixed whatever was wrong (usually vault balance).
      if (!isLikelySignature(body.pledgeSignature)) return bad(400, "Bad pledge signature");
      const { data, error } = await db
        .from("puhb_pledges")
        .update({ refund_status: "DUE", refund_attempts: 0 })
        .eq("signature", body.pledgeSignature)
        .eq("refund_status", "FAILED")
        .select("signature");
      if (error) return bad(500, error.message);
      if (!data?.length) return bad(409, "Pledge is not FAILED");
      await logAction(actor, "refund_retry", null, { pledge: body.pledgeSignature });
      return Response.json({ ok: true });
    }

    case "resolve_orphan": {
      if (!isLikelySignature(body.orphanSignature)) return bad(400, "Bad signature");
      const { error } = await db
        .from("puhb_orphan_payments")
        .update({ resolved: true, note: body.reason ?? "resolved" })
        .eq("signature", body.orphanSignature);
      if (error) return bad(500, error.message);
      await logAction(actor, "orphan_resolved", null, { sig: body.orphanSignature });
      return Response.json({ ok: true });
    }

    default:
      return bad(400, "Unknown action");
  }
}
