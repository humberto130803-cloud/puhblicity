# PUHBLICITY — Complete Build Spec

**Hand this entire file to Claude Code / Fable 5 as the master prompt. The HTML files are the visual source of truth. This document is the behavioral source of truth. Where they disagree, this document wins on logic, the HTML wins on looks.**

---

## 0. Context for the model reading this

You are building a production site that will be deployed to **Solana mainnet** and launched publicly on Instagram **within 5 hours of receiving this prompt**. The person building it has set themselves a challenge: ship a novel, legal, non-exploitative product that takes real money in SOL, and market it the same day from the Instagram handle **@puhblicity**.

This is not a demo. Real people will send real SOL to this site today. Every decision below about custody, refunds, and moderation exists because someone can lose money or get hurt if it is skipped. **Do not skip the refund path to save time. Do not skip the category allowlist to save time.** Those two are the product.

The idea went through a deliberate design process, and you need to understand *why* it has the shape it has, because the shape is load-bearing:

The original concept was an **escalating dare** — strangers pile money onto a dare aimed at a person until someone accepts. That was rejected. It creates a machine where the pot grows fastest on whatever is most dangerous to watch, aimed at a person who never consented, and the person most likely to accept a large pot is the person who most needs the money. That is coercion with a progress bar.

The concept was inverted. **The doer opens the dare.** A person offers to do something themselves — "I'll dye my hair blue if this hits 3 SOL" — and strangers fund that offer. Same escalating pot, same public counter, same screenshot, but consent exists before the money does, and no bounty can be aimed at anyone who didn't opt in. Three constraints keep it that way:

1. **The doer originates every dare.** There is no mechanism, anywhere in the product, for one user to create a dare that another user is expected to perform. If you find yourself building "challenge a friend," stop.
2. **The pot has a hard ceiling.** The number cannot become a pressure device. A filling bar with a visible end is also more urgent for backers than an open-ended one.
3. **Dares come from a fixed category allowlist.** Not free text. This removes heights, vehicles, alcohol, drugs, strangers, sexual content, and endurance/harm from the design space entirely, collapses moderation load to near zero, and makes the site legible in three seconds on Instagram.

These three are **non-negotiable invariants**. If a later instruction, a user request, or a time constraint pushes against one of them, the answer is no.

---

## 1. The product in one paragraph

PUHBLICITY is a public board where people crowdfund each other's small, self-inflicted, funny acts. A doer posts a dare from a fixed menu ("Ghost pepper, on camera"), sets a target between 0.25 and 5 SOL and a deadline, and pays a 0.02 SOL posting fee. Backers send SOL to the pot and watch it fill live. If the target is hit by the deadline, funding closes and the doer has 48 hours to upload video proof. An admin reviews it, and on approval the doer is paid the pot minus a 10% platform cut. If the target is missed, or the proof never comes, or the proof is rejected, **every backer is refunded in full, automatically**. The site earns from the posting fee and the payout cut.

**One-line pitch:** Name your price. Do the thing.

---

## 2. The money model

| Line | Amount | When | Refundable |
|---|---|---|---|
| Posting fee | **0.02 SOL** | On dare creation | No |
| Platform cut | **10% of pot** | On successful payout only | n/a |
| Refund | **100% of pledge** | On any failure path | Platform absorbs network fees |

Constants (put these in one config file, `lib/config.ts`, and import everywhere — never hardcode at a call site):

```ts
export const CONFIG = {
  POSTING_FEE_LAMPORTS:      20_000_000n,   // 0.02 SOL
  MIN_PLEDGE_LAMPORTS:       50_000_000n,   // 0.05 SOL — above dust, keeps refunds economical
  MIN_TARGET_LAMPORTS:      250_000_000n,   // 0.25 SOL
  CEILING_LAMPORTS:       5_000_000_000n,   // 5 SOL — hard cap, invariant #2
  PLATFORM_CUT_BPS:                 1_000,  // 10.00%
  FUNDING_WINDOWS_HOURS:       [24, 72, 168],
  PROOF_WINDOW_HOURS:                  48,
  REVIEW_WINDOW_HOURS:                 24,
  MAX_LIVE_DARES_PER_WALLET:            3,
  MAX_PROOF_BYTES:            100_000_000,  // 100 MB
  MAX_PROOF_SECONDS:                   90,
} as const;
```

**Use `bigint` lamports for every monetary value, everywhere, end to end.** Never `number`. Never floats. Never `parseFloat` on a SOL string. Convert to a display string only at the last moment in the UI layer, via a single `formatSol(lamports: bigint): string` helper. Floating-point drift in a payout is an unrecoverable, publicly visible bug.

---

## 3. Architecture — and the honest custody decision

**You will not write, deploy, or test a custom Anchor program.** That does not fit in 5 hours on mainnet, and a rushed escrow program is worse than no escrow program.

Therefore: **custodial escrow, disclosed plainly.**

- One **platform vault wallet** receives all pledges and the posting fee.
- Pledges are **real on-chain SOL transfers** built by the site and signed by the backer's own wallet.
- Each pledge transaction carries an **SPL Memo instruction** containing the dare ID.
- A server-side indexer watches the vault, matches memos to dares, and credits pledges in the database.
- Payouts and refunds are **server-signed transfers** from the vault.

**This means the platform holds user funds and users must trust the operator.** That is a real trade-off, and it must be stated in plain language in the UI — not buried in a terms page. The site says: *"We hold the pot until the dare settles. We're a small operation, not a bank. The ceiling is 5 SOL for a reason."* Do not use the word "trustless" anywhere on this site. Do not imply the escrow is enforced by a smart contract. It isn't.

Mitigations, all of which you must implement:

- The 5 SOL ceiling caps per-dare exposure.
- A `settings.max_total_open_pot` value; when total open pot across all live dares exceeds it, dare creation is disabled with a clear message.
- The **vault hot key lives only in a server-side environment variable**, never in any file committed to git, never in any client bundle, never in an `NEXT_PUBLIC_` variable. Add a pre-commit check or at minimum grep the build output before deploy.
- All payout/refund logic runs in server routes only.
- A `settings.paused` global kill switch that immediately blocks new dares and new pledges while leaving refunds and payouts operational. **Build the kill switch in the first hour.** It is the thing that saves you at 2am.

**Stack:** Next.js (App Router) + TypeScript, Supabase (Postgres + Storage + RLS), `@solana/web3.js`, `@solana/wallet-adapter` (Phantom, Solflare, Backpack), Helius or Triton RPC (a paid-tier RPC key — public RPC endpoints will rate-limit you on launch day and drop payments), Vercel. Tailwind, with the design tokens from the HTML transcribed into `globals.css` as CSS custom properties.

---

## 4. Data model

```sql
-- All amounts are lamports stored as bigint. No floats anywhere.

create table dares (
  id                text primary key,              -- 8-char uppercase base32, e.g. "K7QM2XPD"
  doer_wallet       text not null,
  doer_name         text not null,                 -- display name, 2-24 chars
  doer_instagram    text,                          -- optional, no @ stored
  category_id       text not null references categories(id),
  detail            text not null,                 -- 0-140 chars, constrained free text (see §6)
  target_lamports   bigint not null,
  pot_lamports      bigint not null default 0,
  backer_count      int not null default 0,
  status            text not null,                 -- see state machine §5
  created_at        timestamptz not null default now(),
  funding_ends_at   timestamptz not null,
  proof_due_at      timestamptz,                   -- set when status -> CLOSED
  proof_url         text,
  proof_note        text,
  proof_submitted_at timestamptz,
  settled_at        timestamptz,
  payout_signature  text,
  reject_reason     text,
  posting_fee_sig   text not null,                 -- proves the fee was paid
  flagged           boolean not null default false,
  constraint target_in_range check (
    target_lamports >= 250000000 and target_lamports <= 5000000000
  )
);

create table pledges (
  signature      text primary key,                 -- tx signature = natural idempotency key
  dare_id        text not null references dares(id),
  backer_wallet  text not null,
  lamports       bigint not null,
  backer_note    text,                             -- optional, 0-80 chars, moderated
  credited_at    timestamptz not null default now(),
  refund_status  text not null default 'NONE',     -- NONE | DUE | SENT | FAILED
  refund_signature text,
  refund_attempts  int not null default 0
);

create table categories (
  id          text primary key,
  label       text not null,                       -- "Ghost pepper, on camera"
  emoji       text not null,
  blurb       text not null,                       -- what counts as proof
  active      boolean not null default true,
  sort_order  int not null
);

create table settings (
  id                  int primary key default 1,
  paused              boolean not null default false,
  max_total_open_pot  bigint not null default 50000000000,  -- 50 SOL
  vault_pubkey        text not null
);

create table admin_log (
  id serial primary key,
  at timestamptz not null default now(),
  actor text not null,
  action text not null,
  dare_id text,
  detail jsonb
);

create index on pledges (dare_id);
create index on pledges (refund_status) where refund_status = 'DUE';
create index on dares (status, funding_ends_at);
```

**RLS:** anon role gets `select` on `dares`, `pledges` (excluding `backer_wallet` — expose a truncated form), and `categories` only. All writes go through server routes using the service key. Never expose the service key to the client.

---

## 5. The state machine — implement this exactly

This is where products like this die. There are seven states and every transition is listed. There is no eighth state.

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
  [create+fee] → OPEN ──target hit──→ CLOSED ──proof up──→ IN_REVIEW
                    │                    │                    │
          deadline, │          proof_due │           approved │  rejected
          under     │            passed  │                    │      │
          target    ↓                    ↓                    ↓      ↓
                REFUNDING ←──────────────┴────────────────────┼──────┘
                    │                                         │
                    ↓                                         ↓
                REFUNDED                                    PAID
```

**States:**

- `OPEN` — accepting pledges. Set on successful posting-fee verification.
- `CLOSED` — target reached, funding shut, waiting on proof. `proof_due_at = now() + 48h`.
- `IN_REVIEW` — proof uploaded, waiting on admin.
- `PAID` — terminal. Doer received `pot − 10%`.
- `REFUNDING` — transient. All pledges marked `refund_status = 'DUE'`, worker is paying them out.
- `REFUNDED` — terminal. Every pledge `SENT`.
- `KILLED` — terminal. Admin removed the dare (rule break, abuse). Behaves exactly like `REFUNDING → REFUNDED` for the money; the difference is only in display and admin log.

**Transitions and their triggers:**

| From | To | Trigger |
|---|---|---|
| — | `OPEN` | Posting fee tx confirmed on-chain and matched |
| `OPEN` | `CLOSED` | Indexer credits a pledge that brings `pot ≥ target` |
| `OPEN` | `REFUNDING` | Cron: `now() > funding_ends_at` and `pot < target` |
| `CLOSED` | `IN_REVIEW` | Doer uploads proof |
| `CLOSED` | `REFUNDING` | Cron: `now() > proof_due_at` and no proof |
| `IN_REVIEW` | `PAID` | Admin approves |
| `IN_REVIEW` | `REFUNDING` | Admin rejects (reason required) |
| `IN_REVIEW` | `REFUNDING` | Cron: `now() > proof_submitted_at + 24h` — **admin failed to review in time, backers get their money back.** This is the clause that protects users from the operator being asleep. Do not omit it. |
| any non-terminal | `KILLED` | Admin kill |
| `REFUNDING` | `REFUNDED` | All pledges `refund_status = 'SENT'` |

**Every transition writes to `admin_log`.** Every transition is guarded by a conditional `UPDATE ... WHERE status = <expected>` so two concurrent workers cannot double-transition. Check `rowCount` and abort if zero.

---

## 6. Content rules — the allowlist

Dares are chosen from a fixed menu. Ship with exactly these twelve. Do not let users invent categories.

| id | label | proof means |
|---|---|---|
| `pepper` | Ghost pepper, on camera | eat it, stay on camera 60s |
| `hair` | Dye my hair a stupid color | before and after in one take |
| `plunge` | Cold plunge, 60 seconds | unbroken shot, visible timer |
| `outfit` | Wear the outfit in public | full day, at least one stranger reacts |
| `cover` | Sing a cover, badly, in public | one take, no edits |
| `dance` | Dance routine in a public place | one take, learn it first |
| `sign` | Hold a sign somewhere busy | 10 minutes, sign legible |
| `ex` | Text my ex what you tell me | screenshot the send, redact them |
| `bio` | Change my bio for 7 days | screenshot day 1 and day 7 |
| `haircut` | Let the internet pick my haircut | before and after |
| `pushups` | 100 pushups, one take | one shot, no cuts |
| `flavor` | Eat the worst flavor combination | one take, finish it |

**The `detail` field** (140 chars) lets the doer add specifics *within* their chosen category. It is the only free text on the dare and it is the main abuse vector. Rules:

- Client-side character cap and a live counter.
- Server-side: reject if it matches a banned-terms list (slurs, sexual terms, self-harm terms, drug and alcohol terms, terms indicating another named person, phone numbers, addresses, links).
- Server-side: reject anything containing a URL or an `@` mention other than the doer's own handle.
- New dares from a wallet with no prior completed dare are `flagged = true` and appear on the board **only after an admin clears them**. This is a 15-second admin action and it is the entire difference between a clean launch and a screenshot of a slur on your front page.
- Backer notes (80 chars) get the same banned-terms filter, and render escaped. Never `dangerouslySetInnerHTML`.

**Hard content bans, enforced in the category list itself:** nothing involving heights, vehicles, water beyond a plunge tub, fire, weapons, alcohol, drugs, fasting or purging, quantities of any consumable beyond a single serving, sexual content, animals, minors, or any act involving a non-consenting third party. The allowlist above already satisfies this. Every future category must be checked against this list before it is added.

**Age gate:** 18+, enforced by a checkbox at dare creation plus a terms clause. It is weak, and it is what is proportionate here. Never weaken it further.

---

## 7. The payment flow — every edge case

### 7.1 Creating a dare

1. Wallet connects. Client checks `settings.paused` and `MAX_LIVE_DARES_PER_WALLET`.
2. Client builds a transaction: `SystemProgram.transfer(doer → vault, 20_000_000)` + `MemoInstruction("PUHB:NEW:" + clientNonce)`.
3. Doer signs and sends. Client posts `{signature, nonce, formData}` to `/api/dares/create`.
4. **Server verifies the transaction itself** — fetches it by signature, confirms it is finalized, confirms the destination is the vault, confirms the amount is exactly the posting fee, confirms the memo matches the nonce, and confirms the signature has not been used before (unique index on `posting_fee_sig`). **Never trust a client-reported payment.** A client that says "I paid" is a client that can lie.
5. Server validates the form, applies the banned-terms filter, inserts the dare with `status = 'OPEN'` and `flagged = true` for new wallets.

### 7.2 Backing a dare

1. Client checks the dare is `OPEN` and `pot < target` and `!paused`.
2. Client builds: `SystemProgram.transfer(backer → vault, amount)` + `MemoInstruction("PUHB:" + dareId)`.
3. Backer signs. Client optimistically shows "confirming" and polls.
4. **The indexer is the source of truth**, not the client. It runs every 10 seconds *and* on a Helius webhook:
   - Fetch new signatures for the vault since the last processed one.
   - For each: parse the memo. If it isn't `PUHB:<dareId>` for a known dare, ignore (but log — it might be someone who sent from an exchange).
   - **Idempotency:** `insert into pledges ... on conflict (signature) do nothing`. Signature is the primary key. A webhook and the poller will both see the same transaction; this makes that harmless.
   - Credit the pot in the same transaction as the pledge insert.
   - If `pot >= target` after crediting → transition to `CLOSED`, set `proof_due_at`.

**Edge cases you must handle explicitly:**

- **Pledge arrives after close.** The tx is already on-chain; you cannot reject it. Credit it as a pledge with `refund_status = 'DUE'` and refund it automatically. Surface this in the UI *before* it happens: "If this closes while your transaction is in flight, we send it straight back."
- **Overfunding at the boundary.** The pledge that crosses the target is accepted in full even if it exceeds the ceiling slightly. The pot displays the true amount. The doer is paid on the true amount. Do not attempt partial acceptance — you cannot partially accept a settled transfer.
- **Pledge below minimum.** Client blocks it. If one arrives anyway (someone crafted it manually), refund it.
- **SPL token or NFT sent to the vault.** Ignore. Do not attempt to handle it. Log it.
- **SOL sent to the vault with no memo or a garbage memo.** Log to a `orphan_payments` view for manual handling. Do not auto-credit it to anything.
- **Sent from an exchange withdrawal.** Memo will be stripped. Show a warning near the pledge button: *"Pledge from your own wallet. Sends from an exchange lose the tag and we can't match them."*
- **Backer wants a refund while OPEN.** Policy: pledges are final while a dare is open. Say so at the point of pledging, not in the terms. A discretionary manual refund path exists via admin, and it costs you nothing to grant one for a genuine mistake.
- **RPC outage during the indexer run.** The indexer must be resumable: store `last_processed_signature`, and on restart walk backwards until you hit it. Never assume you saw everything.
- **The doer's wallet is an exchange deposit address.** Warn at creation: *"Payouts go to the wallet you're connected with. Use a wallet you control, not an exchange address."*

### 7.3 Payout

On admin approval: compute `cut = pot * 1000n / 10000n`, `payout = pot - cut`. Transfer `payout` from vault to `doer_wallet`. Record the signature. Set `PAID`. The cut simply stays in the vault — do not build a separate sweep for it today.

### 7.4 Refunds — build this first, before the board, before the pretty pages

A refund worker runs on a cron every minute:

1. Select pledges where `refund_status = 'DUE'` and `refund_attempts < 5`, in batches.
2. For each: send the **full pledged amount** back to `backer_wallet`. The platform absorbs the ~0.000005 SOL network fee. Never deduct a fee from a refund. A partial refund reads as theft.
3. Mark `SENT` with the signature. On failure, increment `refund_attempts` and retry with backoff; at 5, mark `FAILED` and raise it in the admin panel for manual handling.
4. When a dare has zero `DUE` pledges left, set `REFUNDED`.

**Idempotency is critical.** Before sending, re-check `refund_status = 'DUE'` inside a transaction with `select ... for update`. A double-send is real money gone and there is no clawback on Solana.

Keep enough SOL in the vault to cover network fees for every outstanding refund plus a buffer. Alert the admin below a threshold.

---

## 8. Proof

- Doer uploads to Supabase Storage: video only, `MAX_PROOF_BYTES`, `MAX_PROOF_SECONDS`, MIME allowlist `video/mp4, video/quicktime, video/webm`. Validate MIME **server-side**, not just by extension.
- Optional 200-char note.
- Stored in a **private bucket**; the site serves signed URLs with a short TTL. Proof videos are of real people and must not be permanently public by default. On `PAID`, the video becomes viewable on the dare page (still via signed URL) because backers paid to see it — say this clearly at upload: *"If this gets approved, your backers can watch it on the dare page."*
- A doer may replace their proof any time before review.
- **Right to erasure:** a doer can request their video be deleted after payout. Honor it; keep the dare record and the outcome, drop the file. Put this in the privacy policy and mean it.
- Encourage but do not require a public Instagram post tagging @puhblicity. Dares with a linked post get featured on the wall — that is your marketing loop, and it costs you nothing.

---

## 9. Admin

A single admin wallet, checked server-side against an env var, gated by a signed-message login (not just "is this pubkey connected" — require a signature over a nonce).

The panel shows, in priority order: proofs awaiting review with time remaining on the 24h clock, flagged new dares awaiting clearance, failed refunds, orphan payments, vault balance, total open pot, and the global pause switch.

Actions: clear/reject a flagged dare, approve/reject a proof (rejection requires a reason, which is shown to the doer), kill a dare, issue a manual refund, pause the site.

**You are the single point of failure and you will be asleep at some point.** The 24-hour auto-refund on unreviewed proofs (§5) is what makes that acceptable rather than negligent. Test that path before launch.

---

## 10. Legal and risk — read this once, act on it

- **Not gambling.** Payout depends on performing a specified act, not on chance. Keep it that way: never add randomness, never add a "winner takes all" mechanic, never let backers profit from an outcome. The moment a backer can win money, this becomes a regulated product in most jurisdictions.
- **Not an investment.** Never suggest a pledge appreciates, is resellable, or returns anything. Backers get a video and a name on a wall. Say exactly that.
- **Custody.** Holding and transmitting other people's funds is a regulated activity in many places. Small scale and a 5 SOL cap are not a legal defense; they are a risk reduction. Get advice before scaling. Keep records of every transaction from day one — you already are, via the tables above.
- **Taxes.** Posting fees and platform cuts are business income in SOL at the fair value on receipt. Keep the ledger.
- **Sanctions.** At minimum, screen connected wallets against a public OFAC-flagged address list and block a small set of jurisdictions in the terms. Note it honestly as best-effort.
- **Ship real pages, not placeholders:** Terms, Privacy (covering video storage and erasure), and a plain-English "How the money works" page. The last one doubles as marketing.
- **Instagram:** no giveaway framing, no "guaranteed returns" language, no engagement-bait mechanics that violate platform rules.
- **Impersonation.** Someone will post a dare pretending to be a known person. Optional handle verification: the doer puts a 6-character code in their Instagram bio and the site marks them verified. Post-launch, not today — but reserve the `verified` column now.

---

## 11. Build order — the 5 hours

Do it in this order. If you run out of time, the things at the bottom are the things you cut.

| Time | Block |
|---|---|
| 0:00–0:25 | Repo, Supabase schema, config constants, `formatSol`, wallet adapter, **pause switch** |
| 0:25–1:10 | Create-dare flow: fee tx, **server-side tx verification**, validation, banned terms |
| 1:10–1:55 | Pledge tx + memo, indexer with signature idempotency, pot crediting, OPEN→CLOSED |
| 1:55–2:35 | **Refund worker and every REFUNDING path.** Test with real 0.05 SOL on mainnet. |
| 2:35–3:10 | Board + dare detail UI, transcribed from the HTML |
| 3:10–3:40 | Proof upload, admin panel, approve → payout, reject → refund |
| 3:40–4:00 | Create page, my-dares, static pages, share card |
| 4:00–4:25 | Deploy. **Mainnet smoke test: fund a real dare, close it, refund it, then do one that pays out.** |
| 4:25–5:00 | Seed 3 dares (do the first one yourself), film it, launch on Instagram |

**Launch content plan:** your own dare goes up first, at a low target, and you film the completion. The product's marketing material is its own output — a filling bar is the most watchable state change there is, and a completed dare is a ready-made Reel. Post the bar filling, not the site.

---

## 12. Voice

Telethon host: brisk, warm, slightly carnival, never cruel, never crypto-bro. Sentence case. Plain verbs. The doer is always the hero and never the butt of the joke — the *dare* is funny, the *person* is game.

Vocabulary, used consistently everywhere including toasts and errors:

- The person doing it: **the doer**
- The thing: **a dare**
- Supporting it: **back** (button: "Back this dare"; result: "Backed")
- The money: **the pot**
- The minimum: **the target**
- The maximum: **the ceiling**
- Settling: **paid out** / **refunded**

Errors state what happened and what to do, in the interface's voice: *"This dare closed while your transaction was in flight. Your 0.25 SOL is on its way back — usually under a minute."* Empty states invite action: *"No dares open right now. Somebody has to go first."*

---

## 13. Design direction (the HTML is the source of truth)

The world this borrows from is the **charity telethon tote board** — segmented digit plates, a red thermometer climbing toward a goal, ribbon banners, rubber-stamped receipts. It is warm, public, and about a number going up in front of an audience, which is exactly what this product is. It is deliberately not crypto-purple, not dark-mode-with-neon, not minimal-Swiss.

**Tokens:**

```css
--ink:    #14202E;  /* deep navy-black — text, plates, borders */
--field:  #143A6B;  /* telethon blue — panels, the board */
--paper:  #EDF0F2;  /* studio white — page background */
--flare:  #FF3B2E;  /* thermometer red — money, primary action */
--gold:   #FFC53D;  /* tote digits, celebration */
--jade:   #0E8A6A;  /* paid, confirmed */
--slate:  #5E7086;  /* secondary text */
```

**Type:** Anton for display (condensed, tall, tote-board bold — used with restraint, headlines only). Archivo for body and UI. DM Mono for all numbers, labels, eyebrows, IDs, and timers — **every SOL amount is monospaced and tabular** so digits don't jitter as the pot climbs.

**Signature element: the tote.** Every SOL amount of consequence renders as individual gold digits on dark navy plates with hairline gaps, above a red thermometer bar with a notched marker at the target and a hard stop at the ceiling. It appears on the hero, on every card, and on the detail page at full scale. It is the one bold thing; everything around it stays disciplined — flat colors, 2px borders, hard offset shadows, no gradients, no blur, no glass.

**Motion:** one orchestrated moment only — the tote digits flip and the thermometer animates when a pledge lands. Everything else is a 120ms hover. Respect `prefers-reduced-motion`: digits swap without animating.

**Quality floor:** responsive to 360px, visible keyboard focus rings, all interactive elements reachable by tab, contrast checked against the paper and field backgrounds, `aria-live` on the pot so a screen reader announces the climb.

---

## 14. What not to build today

Comments. Following. Notifications. Search. A token. An NFT. A leaderboard of backers by amount (it turns backing into a spending contest). Recurring dares. Anything involving one user targeting another. A mobile app. Multi-currency. Anything that requires a smart contract.

Ship the loop: post → back → close → prove → pay. That loop, working correctly with real money and real refunds, is the entire product.
