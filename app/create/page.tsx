import { mustDb } from "@/lib/db";
import { getSettings } from "@/lib/dares";
import { CreateForm } from "@/components/create-form";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.meta.createTitle };
}

export default async function CreatePage() {
  const { locale } = await getT();
  const [{ data: rows }, settings] = await Promise.all([
    mustDb()
      .from("puhb_categories")
      .select("id, label, blurb, emoji, group_label, label_es, blurb_es")
      .eq("active", true)
      .order("sort_order"),
    getSettings(),
  ]);

  // The menu itself lives in the database, so the language swap happens
  // here rather than in the dictionary. Missing Spanish falls back to
  // English instead of rendering an empty tile.
  const categories = (rows ?? []).map((c) => ({
    id: c.id,
    emoji: c.emoji,
    group_label: c.group_label,
    label: (locale === "es" ? c.label_es || c.label : c.label) ?? "",
    blurb: (locale === "es" ? c.blurb_es || c.blurb : c.blurb) ?? "",
  }));

  return (
    <CreateForm
      categories={categories}
      paused={settings.paused}
      vault={settings.vault_pubkey}
    />
  );
}
