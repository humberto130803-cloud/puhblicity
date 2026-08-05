import { CONFIG } from "@/lib/config";
import { mustDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { verifyPostingFee } from "@/lib/verify";
import { checkPublicText, cleanText } from "@/lib/text-safety";
import { newDareId } from "@/lib/ids";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";
import { getSettings, countLiveDares, hasCompletedDare } from "@/lib/dares";
import { logAction } from "@/lib/state";

function bad(status: number, error: string) {
  return Response.json({ error }, { status });
}

/**
 * Creates a dare. The client already paid the 0.02 SOL posting fee and hands
 * us the signature + nonce; we verify the transaction ourselves on-chain
 * (destination, exact amount, memo, unused signature). §7.1.
 */
export async function POST(request: Request) {
  if (!(await checkRateLimit(`create:${clientIp(request)}`, 6, 60_000))) {
    return bad(429, "Slow down");
  }

  const session = await getSession();
  if (!session) return bad(401, "Sign in first");

  let body: {
    signature?: string;
    nonce?: string;
    doerName?: string;
    instagram?: string;
    categoryId?: string;
    detail?: string;
    targetLamports?: string;
    fundingHours?: number;
    ageConfirmed?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return bad(400, "Invalid JSON");
  }

  const settings = await getSettings();
  if (settings.paused) {
    return bad(503, "PUHBLICITY is paused right now. Nothing new until it's back — funds already pledged are unaffected.");
  }

  // ---- form validation, before we spend an RPC call ----
  if (!body.ageConfirmed) return bad(400, "You must confirm you're 18 or older.");

  const doerName = cleanText(body.doerName ?? "");
  if (doerName.length < 2 || doerName.length > 24) {
    return bad(400, "Name: 2 to 24 characters.");
  }

  let instagram: string | null = null;
  if (body.instagram) {
    const ig = cleanText(body.instagram).replace(/^@/, "");
    if (!/^[a-zA-Z0-9_.]{1,30}$/.test(ig)) return bad(400, "That Instagram handle doesn't look right.");
    instagram = ig;
  }

  const db = mustDb();
  const { data: category } = await db
    .from("puhb_categories")
    .select("id")
    .eq("id", body.categoryId ?? "")
    .eq("active", true)
    .maybeSingle();
  if (!category) return bad(400, "Pick a dare from the menu. The menu is the product.");

  const detailCheck = checkPublicText(body.detail ?? "", 140, instagram);
  if (!detailCheck.ok) return bad(400, detailCheck.reason);

  let target: bigint;
  try {
    target = BigInt(body.targetLamports ?? "");
  } catch {
    return bad(400, "Bad target amount.");
  }
  if (target < CONFIG.MIN_TARGET_LAMPORTS || target > CONFIG.CEILING_LAMPORTS) {
    return bad(400, "Target must be between 0.25 and 5 SOL.");
  }

  const hours = Number(body.fundingHours);
  if (!(CONFIG.FUNDING_WINDOWS_HOURS as readonly number[]).includes(hours)) {
    return bad(400, "Pick a funding window: 24h, 3 days, or 7 days.");
  }

  if (typeof body.signature !== "string" || typeof body.nonce !== "string") {
    return bad(400, "Missing fee transaction.");
  }

  // ---- caps ----
  const live = await countLiveDares(session.pubkey);
  if (live >= CONFIG.MAX_LIVE_DARES_PER_WALLET) {
    return bad(400, `You have ${live} live dares. Settle one before opening another.`);
  }

  const { data: openPot } = await db.rpc("puhb_open_pot_total");
  if (openPot !== null && BigInt(openPot) + target > BigInt(settings.max_total_open_pot)) {
    return bad(503, "The board is at capacity right now. Try again after some dares settle — the total we hold at once is capped on purpose.");
  }

  // ---- on-chain fee verification. Never trust a client-reported payment. ----
  const fee = await verifyPostingFee(body.signature, body.nonce);
  if (!fee.ok) return bad(402, fee.error);
  if (fee.payer !== session.pubkey) {
    return bad(403, "The fee was paid by a different wallet than the one signed in.");
  }

  // New wallets (no prior completed dare) are flagged: on the board only
  // after an admin clears them. 15 seconds of admin time vs. a slur on the
  // front page — the entire difference between launches.
  const flagged = !(await hasCompletedDare(session.pubkey));

  const id = newDareId();
  const { error } = await db.from("puhb_dares").insert({
    id,
    doer_wallet: session.pubkey,
    doer_name: doerName,
    doer_instagram: instagram,
    category_id: category.id,
    detail: detailCheck.value,
    target_lamports: target.toString(),
    status: "OPEN",
    funding_ends_at: new Date(Date.now() + hours * 3600_000).toISOString(),
    posting_fee_sig: body.signature,
    flagged,
  });
  if (error) {
    if (error.message.includes("posting_fee_sig")) {
      // Idempotent retry: if the "duplicate" is this wallet's own dare from
      // an attempt the client thought failed, hand it back as success —
      // never make someone pay a second fee for a network blip.
      const { data: existing } = await db
        .from("puhb_dares")
        .select("id, doer_wallet, flagged")
        .eq("posting_fee_sig", body.signature)
        .maybeSingle();
      if (existing && existing.doer_wallet === session.pubkey) {
        return Response.json({ ok: true, id: existing.id, flagged: existing.flagged });
      }
      return bad(409, "That fee transaction was already used for a dare.");
    }
    return bad(500, "Could not save the dare. Your fee signature is safe — try again with the same one.");
  }

  await logAction(session.pubkey, "dare_created", id, { flagged, target: target.toString() });

  return Response.json({ ok: true, id, flagged });
}
