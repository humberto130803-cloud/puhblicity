import { mustDb } from "@/lib/db";
import { getSettings } from "@/lib/dares";
import { CreateForm } from "@/components/create-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Post a dare — PUHBLICITY" };

export default async function CreatePage() {
  const [{ data: categories }, settings] = await Promise.all([
    mustDb()
      .from("puhb_categories")
      .select("id, label, emoji, blurb, group_label")
      .eq("active", true)
      .order("sort_order"),
    getSettings(),
  ]);

  return (
    <CreateForm
      categories={categories ?? []}
      paused={settings.paused}
      vault={settings.vault_pubkey}
    />
  );
}
