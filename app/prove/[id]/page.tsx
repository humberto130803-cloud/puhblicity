import { notFound, redirect } from "next/navigation";
import { getDare, toPublicDare } from "@/lib/dares";
import { getSession } from "@/lib/session";
import { isDareId } from "@/lib/ids";
import { ProveForm } from "@/components/prove-form";
import { getLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ProvePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!isDareId(id)) notFound();

  const dare = await getDare(id);
  if (!dare) notFound();

  const session = await getSession();
  if (!session || session.pubkey !== dare.doer_wallet) redirect(`/d/${id}`);
  if (dare.status !== "CLOSED" && dare.status !== "IN_REVIEW") redirect(`/d/${id}`);

  return <ProveForm dare={toPublicDare(dare, await getLocale())} />;
}
