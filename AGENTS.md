# This is NOT the Next.js you know

This version has breaking changes — read the relevant guide in
`node_modules/next/dist/docs/` before writing any code.

# PUHBLICITY

Custodial dare-crowdfunding board on Solana mainnet. Real money. The full
behavioral spec is `docs/SPEC.md` — read it before touching money paths.

## Non-negotiable invariants

1. **The doer originates every dare.** No mechanism may let one user create
   a dare another user performs. "Challenge a friend" is a rejected design.
2. **The pot has a hard ceiling** (5 SOL). The number must never become a
   pressure device.
3. **Dares come from the fixed category allowlist.** Never free text.

## Load-bearing facts

- Shares SOLMATE's Supabase project — every object is prefixed `puhb_`.
  Migrations tracked in `puhb_schema_migrations` (NOT the shared
  `schema_migrations`). Run `node scripts/migrate.mjs`.
- All money is **bigint lamports** end to end. `lib/format.ts` is the only
  place lamports become text. No floats, ever.
- RLS denies anon everything; all reads/writes go through server routes.
- The vault hot key lives ONLY in env (`VAULT_SECRET_KEY`). After any build:
  grep `.next/static` for it before deploying.
- Refunds/payouts are claim-guarded and memo-tagged (`PUHB:REFUND:*`,
  `PUHB:PAYOUT:*`); crash recovery consults the chain by memo before ever
  resending. Double-sends have no clawback.
- Settlement heartbeat: GitHub Actions cron (floor, ~5 min) + opportunistic
  `maybeTick()` on page traffic + instant `/api/pledges/notify`.
- Never use the word "trustless" anywhere. Custody is disclosed plainly.
