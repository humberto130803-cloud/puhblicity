import { mustDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getDare } from "@/lib/dares";
import { isDareId } from "@/lib/ids";
import { transition, logAction } from "@/lib/state";
import { checkPublicText } from "@/lib/text-safety";
import { CONFIG } from "@/lib/config";

const ALLOWED_MIME = ["video/mp4", "video/quicktime", "video/webm"];

/**
 * Step 2: the upload finished; verify the object server-side (exists, video
 * MIME, size cap — the bucket enforced these too, we double-check) and move
 * the dare to IN_REVIEW. Uploading again before review replaces the proof.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  let body: { dareId?: string; path?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isDareId(body.dareId)) return Response.json({ error: "No such dare" }, { status: 404 });
  const dare = await getDare(body.dareId);
  if (!dare) return Response.json({ error: "No such dare" }, { status: 404 });
  if (dare.doer_wallet !== session.pubkey) {
    return Response.json({ error: "Only the doer uploads proof" }, { status: 403 });
  }
  if (dare.status !== "CLOSED" && dare.status !== "IN_REVIEW") {
    return Response.json({ error: `This dare is ${dare.status}.` }, { status: 400 });
  }
  if (typeof body.path !== "string" || !body.path.startsWith(`${dare.id}/`)) {
    return Response.json({ error: "Bad upload path" }, { status: 400 });
  }

  const db = mustDb();
  const { data: info, error: infoErr } = await db.storage
    .from("puhb-proofs")
    .info(body.path);
  if (infoErr || !info) {
    return Response.json({ error: "Upload not found — did it finish?" }, { status: 400 });
  }
  const mime = info.contentType ?? "";
  if (!ALLOWED_MIME.includes(mime)) {
    return Response.json({ error: "Video only: mp4, mov, or webm." }, { status: 400 });
  }
  if ((info.size ?? 0) > CONFIG.MAX_PROOF_BYTES) {
    return Response.json({ error: "Proof is over 50 MB — trim or compress it." }, { status: 400 });
  }

  let note: string | null = null;
  if (typeof body.note === "string" && body.note.trim()) {
    const check = checkPublicText(body.note, 200, dare.doer_instagram);
    if (!check.ok) return Response.json({ error: check.reason }, { status: 400 });
    note = check.value;
  }

  const nowIso = new Date().toISOString();
  if (dare.status === "CLOSED") {
    const ok = await transition(
      dare.id,
      "CLOSED",
      "IN_REVIEW",
      session.pubkey,
      { proof_path: body.path, proof_note: note, proof_submitted_at: nowIso },
      { path: body.path }
    );
    if (!ok) return Response.json({ error: "The dare changed state — reload." }, { status: 409 });
  } else {
    // Replacing proof while IN_REVIEW: the 24h review clock does NOT reset —
    // it protects backers, and a doer re-uploading must not extend custody.
    await db
      .from("puhb_dares")
      .update({ proof_path: body.path, proof_note: note })
      .eq("id", dare.id)
      .eq("status", "IN_REVIEW");
    await logAction(session.pubkey, "proof_replaced", dare.id, { path: body.path });
  }

  return Response.json({ ok: true });
}
