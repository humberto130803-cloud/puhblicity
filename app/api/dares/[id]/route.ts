import { getDare, getDarePledges, getSettings, toPublicDare } from "@/lib/dares";
import { getSession, isAdminPubkey } from "@/lib/session";
import { isDareId } from "@/lib/ids";
import { maybeTick } from "@/lib/tick";
import { getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  maybeTick();
  const { id } = await ctx.params;
  if (!isDareId(id)) return Response.json({ error: "No such dare" }, { status: 404 });

  const dare = await getDare(id);
  if (!dare) return Response.json({ error: "No such dare" }, { status: 404 });

  const session = await getSession();
  const isOwner = !!session && session.pubkey === dare.doer_wallet;
  const isAdmin = !!session && isAdminPubkey(session.pubkey);

  // A flagged dare is visible only to its owner and the admin.
  if (dare.flagged && !isOwner && !isAdmin) {
    return Response.json({ error: "No such dare" }, { status: 404 });
  }

  const [pledges, settings, locale] = await Promise.all([
    getDarePledges(id),
    getSettings(),
    getLocale(),
  ]);
  return Response.json({
    dare: toPublicDare(dare, locale),
    pledges,
    isOwner,
    paused: settings.paused,
    vault: settings.vault_pubkey,
    flagged: dare.flagged,
  });
}
