import { mustDb } from "@/lib/db";
import { getSettings } from "@/lib/dares";
import { CreateForm } from "@/components/create-form";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const [{ data: categories }, settings] = await Promise.all([
    mustDb()
      .from("puhb_categories")
      .select("id, label, emoji, blurb")
      .eq("active", true)
      .order("sort_order"),
    getSettings(),
  ]);

  return (
    <div className="wrap">
      <section className="hero" style={{ paddingBottom: 10 }}>
        <p className="eyebrow">Open a dare</p>
        <h1 className="display" style={{ fontSize: "clamp(32px, 6vw, 60px)" }}>
          You do the thing. <span style={{ color: "var(--flare)" }}>They pay for it.</span>
        </h1>
        <p className="sub">
          Pick from the menu, set your price, pay 0.02 SOL to post. You dare
          only yourself — that&apos;s the whole point of this place.
        </p>
      </section>
      <CreateForm
        categories={categories ?? []}
        paused={settings.paused}
        vault={settings.vault_pubkey}
      />
    </div>
  );
}
