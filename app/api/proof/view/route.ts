import { mustDb } from "@/lib/db";
import { getSession, isAdminPubkey } from "@/lib/session";
import { getDare } from "@/lib/dares";
import { isDareId } from "@/lib/ids";

/**
 * Short-TTL signed URL for a proof video. Private bucket always; who may
 * look depends on state: the doer and the admin any time, everyone once the
 * dare is PAID — backers paid to see it (§8).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const dareId = url.searchParams.get("dare");
  if (!isDareId(dareId)) return Response.json({ error: "No such dare" }, { status: 404 });

  const dare = await getDare(dareId);
  if (!dare || !dare.proof_path) {
    return Response.json({ error: "No proof here" }, { status: 404 });
  }

  const session = await getSession();
  const isOwner = !!session && session.pubkey === dare.doer_wallet;
  const isAdmin = !!session && isAdminPubkey(session.pubkey);
  // Public only while the window is open. After that the file is deleted
  // anyway — this just stops a signed URL being handed out in the gap
  // between expiry and the next cron tick.
  const windowOpen =
    dare.status === "PAID" &&
    !!dare.proof_public_until &&
    new Date(dare.proof_public_until) > new Date();

  if (!isOwner && !isAdmin && !windowOpen) {
    return Response.json(
      {
        error:
          dare.status === "PAID"
            ? "This proof has come down. Videos stay up for 48 hours after payout, then they're deleted."
            : "Proof unlocks when the dare is paid out",
      },
      { status: 403 }
    );
  }

  const { data, error } = await mustDb()
    .storage.from("puhb-proofs")
    .createSignedUrl(dare.proof_path, 600);
  if (error || !data) {
    return Response.json({ error: "Could not sign the URL" }, { status: 500 });
  }
  return Response.json({ ok: true, url: data.signedUrl });
}
