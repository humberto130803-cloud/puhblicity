import { mustDb } from "@/lib/db";
import { shortWallet } from "@/lib/format";
import type { Locale } from "@/lib/i18n/types";

/**
 * Query helpers and the public shaping layer. Full wallet addresses never
 * leave the server: backers and doers appear truncated ("8sVa…FxQN")
 * everywhere public. The owner sees their own dare in full via session match.
 */

export type PublicPledge = {
  signature: string;
  backer: string; // truncated
  lamports: string; // bigint as string over the wire
  note: string | null;
  at: string;
  refund_status: string;
};

export type PublicDare = {
  id: string;
  doer_name: string;
  doer_instagram: string | null;
  doer_wallet_short: string;
  category_id: string;
  category_label: string;
  category_short: string;
  category_emoji: string;
  category_blurb: string;
  detail: string;
  target: string; // lamports as string
  pot: string; // lamports as string
  backer_count: number;
  status: string;
  created_at: string;
  funding_ends_at: string;
  proof_due_at: string | null;
  proof_note: string | null;
  proof_submitted_at: string | null;
  settled_at: string | null;
  payout_signature: string | null;
  reject_reason: string | null;
  has_proof: boolean;
  /** While set and in the future, anyone can watch the proof. */
  proof_public_until: string | null;
  /** Set once the file has actually been deleted. */
  proof_deleted_at: string | null;
  verified: boolean;
};

/**
 * Category text in the reader's language, falling back to English when a
 * translation is missing — a category added later without Spanish should
 * degrade to English, never to an empty card.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function categoryText(c: any, locale: Locale) {
  const pick = (es: string | null | undefined, en: string | null | undefined) =>
    (locale === "es" ? es || en : en) ?? "";
  return {
    label: pick(c?.label_es, c?.label),
    short: pick(c?.short_label_es, c?.short_label),
    blurb: pick(c?.blurb_es, c?.blurb),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPublicDare(d: any, locale: Locale = "en"): PublicDare {
  const cat = categoryText(d.puhb_categories, locale);
  return {
    id: d.id,
    doer_name: d.doer_name,
    doer_instagram: d.doer_instagram,
    doer_wallet_short: shortWallet(d.doer_wallet),
    category_id: d.category_id,
    category_label: cat.label || d.category_label || "",
    category_short: cat.short || d.category_short || "",
    category_emoji: d.puhb_categories?.emoji ?? d.category_emoji ?? "",
    category_blurb: cat.blurb || d.category_blurb || "",
    detail: d.detail,
    target: String(d.target_lamports),
    pot: String(d.pot_lamports),
    backer_count: d.backer_count,
    status: d.status,
    created_at: d.created_at,
    funding_ends_at: d.funding_ends_at,
    proof_due_at: d.proof_due_at,
    proof_note: d.proof_note,
    proof_submitted_at: d.proof_submitted_at,
    settled_at: d.settled_at,
    payout_signature: d.payout_signature,
    reject_reason: d.reject_reason,
    has_proof: !!d.proof_path,
    proof_public_until: d.proof_public_until ?? null,
    proof_deleted_at: d.proof_deleted_at ?? null,
    verified: !!d.verified,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPublicPledge(p: any): PublicPledge {
  return {
    signature: p.signature,
    backer: shortWallet(p.backer_wallet),
    lamports: String(p.lamports),
    note: p.backer_note,
    at: p.credited_at,
    refund_status: p.refund_status,
  };
}

const DARE_SELECT =
  "*, puhb_categories(label, short_label, emoji, blurb, label_es, short_label_es, blurb_es)";

/** Board: flagged dares are invisible until an admin clears them. */
export async function listBoardDares(locale: Locale = "en"): Promise<PublicDare[]> {
  const { data, error } = await mustDb()
    .from("puhb_dares")
    .select(DARE_SELECT)
    .eq("flagged", false)
    .in("status", ["OPEN", "CLOSED", "IN_REVIEW", "PAID"])
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data ?? []).map((d) => toPublicDare(d, locale));
}

export async function getDare(id: string) {
  const { data } = await mustDb()
    .from("puhb_dares")
    .select(DARE_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getDarePledges(id: string): Promise<PublicPledge[]> {
  const { data } = await mustDb()
    .from("puhb_pledges")
    .select("*")
    .eq("dare_id", id)
    .order("credited_at", { ascending: false })
    .limit(200);
  return (data ?? []).map(toPublicPledge);
}

export type Settings = {
  paused: boolean;
  max_total_open_pot: string;
  vault_pubkey: string;
};

export async function getSettings(): Promise<Settings> {
  const { data } = await mustDb()
    .from("puhb_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  // No settings row = paused. The safe failure mode.
  if (!data) return { paused: true, max_total_open_pot: "0", vault_pubkey: "" };
  return {
    paused: data.paused,
    max_total_open_pot: String(data.max_total_open_pot),
    vault_pubkey: data.vault_pubkey,
  };
}

/** Live (non-terminal) dares for one wallet — the per-wallet cap check. */
export async function countLiveDares(wallet: string): Promise<number> {
  const { count } = await mustDb()
    .from("puhb_dares")
    .select("*", { count: "exact", head: true })
    .eq("doer_wallet", wallet)
    .in("status", ["OPEN", "CLOSED", "IN_REVIEW"]);
  return count ?? 0;
}

/** Has this wallet ever completed (been paid for) a dare? Gates auto-flagging. */
export async function hasCompletedDare(wallet: string): Promise<boolean> {
  const { count } = await mustDb()
    .from("puhb_dares")
    .select("*", { count: "exact", head: true })
    .eq("doer_wallet", wallet)
    .eq("status", "PAID");
  return (count ?? 0) > 0;
}
