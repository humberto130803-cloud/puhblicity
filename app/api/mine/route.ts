import { mustDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toPublicDare } from "@/lib/dares";

export const dynamic = "force-dynamic";

/** The signed-in wallet's own dares — including flagged ones. */
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  const { data } = await mustDb()
    .from("puhb_dares")
    .select("*, puhb_categories(label, emoji, blurb)")
    .eq("doer_wallet", session.pubkey)
    .order("created_at", { ascending: false });

  return Response.json({
    dares: (data ?? []).map((d) => ({
      ...toPublicDare(d),
      flagged: d.flagged,
    })),
  });
}
