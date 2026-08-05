import { mustDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getDare } from "@/lib/dares";
import { isDareId } from "@/lib/ids";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

const EXT_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

/**
 * Step 1 of proof upload: the doer gets a signed upload URL into the private
 * bucket. The bucket itself enforces the MIME allowlist and 100 MB cap
 * server-side. Direct-to-storage because proof videos exceed what a
 * serverless route body allows.
 */
export async function POST(request: Request) {
  if (!(await checkRateLimit(`proofstart:${clientIp(request)}`, 10, 60_000))) {
    return Response.json({ error: "Slow down" }, { status: 429 });
  }
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  let body: { dareId?: string; mime?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isDareId(body.dareId)) return Response.json({ error: "No such dare" }, { status: 404 });
  const ext = EXT_BY_MIME[body.mime ?? ""];
  if (!ext) {
    return Response.json({ error: "Video only: mp4, mov, or webm." }, { status: 400 });
  }

  const dare = await getDare(body.dareId);
  if (!dare) return Response.json({ error: "No such dare" }, { status: 404 });
  if (dare.doer_wallet !== session.pubkey) {
    return Response.json({ error: "Only the doer uploads proof" }, { status: 403 });
  }
  // Replace allowed any time before review settles (§8).
  if (dare.status !== "CLOSED" && dare.status !== "IN_REVIEW") {
    return Response.json({ error: `This dare is ${dare.status} — no proof needed now.` }, { status: 400 });
  }

  const path = `${dare.id}/proof-${Date.now()}.${ext}`;
  const { data, error } = await mustDb()
    .storage.from("puhb-proofs")
    .createSignedUploadUrl(path);
  if (error || !data) {
    return Response.json({ error: "Could not start the upload — try again." }, { status: 500 });
  }
  return Response.json({ ok: true, path, token: data.token, signedUrl: data.signedUrl });
}
