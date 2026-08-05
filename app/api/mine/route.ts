import { mustDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toPublicDare } from "@/lib/dares";
import { computePayout } from "@/lib/settle";

export const dynamic = "force-dynamic";

/**
 * The signed-in wallet's whole world: their dares (including flagged),
 * the dares they've backed, and the four numbers at the top of the page.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const db = mustDb();

  const [{ data: dares }, { data: myPledges }] = await Promise.all([
    db
      .from("puhb_dares")
      .select("*, puhb_categories(label, short_label, emoji, blurb)")
      .eq("doer_wallet", session.pubkey)
      .order("created_at", { ascending: false }),
    db
      .from("puhb_pledges")
      .select("*, puhb_dares(id, doer_name, status, puhb_categories(label, emoji))")
      .eq("backer_wallet", session.pubkey)
      .order("credited_at", { ascending: false }),
  ]);

  let paidToMe = 0n;
  let inOpenPots = 0n;
  for (const d of dares ?? []) {
    const pot = BigInt(d.pot_lamports);
    if (d.status === "PAID") paidToMe += computePayout(pot).payout;
    if (["OPEN", "CLOSED", "IN_REVIEW"].includes(d.status)) inOpenPots += pot;
  }
  let backedTotal = 0n;
  let refundedToMe = 0n;
  for (const p of myPledges ?? []) {
    backedTotal += BigInt(p.lamports);
    if (p.refund_status === "SENT") refundedToMe += BigInt(p.lamports);
  }

  return Response.json({
    dares: (dares ?? []).map((d) => ({ ...toPublicDare(d), flagged: d.flagged })),
    backed: (myPledges ?? []).map((p) => ({
      signature: p.signature,
      lamports: String(p.lamports),
      refund_status: p.refund_status,
      refund_signature: p.refund_signature,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dare: (() => { const d = p.puhb_dares as any; return d ? {
        id: d.id, doer_name: d.doer_name, status: d.status,
        label: d.puhb_categories?.label ?? "", emoji: d.puhb_categories?.emoji ?? "",
      } : null; })(),
    })),
    stats: {
      paidToMe: paidToMe.toString(),
      inOpenPots: inOpenPots.toString(),
      backed: backedTotal.toString(),
      refundedToMe: refundedToMe.toString(),
    },
  });
}
