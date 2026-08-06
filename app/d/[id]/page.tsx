import { notFound } from "next/navigation";
import { getDare, getDarePledges, getSettings, toPublicDare } from "@/lib/dares";
import { getSession, isAdminPubkey } from "@/lib/session";
import { isDareId } from "@/lib/ids";
import { DareView } from "@/components/dare-view";
import { getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DarePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  if (!isDareId(id)) notFound();

  const dare = await getDare(id);
  if (!dare) notFound();

  const session = await getSession();
  const isOwner = !!session && session.pubkey === dare.doer_wallet;
  const isAdmin = !!session && isAdminPubkey(session.pubkey);
  if (dare.flagged && !isOwner && !isAdmin) notFound();

  const [pledges, settings, locale] = await Promise.all([
    getDarePledges(id),
    getSettings(),
    getLocale(),
  ]);

  return (
    <DareView
      initialDare={toPublicDare(dare, locale)}
      initialPledges={pledges}
      isOwner={isOwner}
      flagged={dare.flagged}
      paused={settings.paused}
      vault={settings.vault_pubkey}
    />
  );
}
