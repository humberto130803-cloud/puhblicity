# PUHBLICITY

**Name your price. Do the thing.**

A public board where people crowdfund each other's small, self-inflicted,
funny acts — on Solana mainnet.

- A **doer** posts a dare from a fixed menu, sets a target (0.25–5 SOL) and
  a deadline, and pays a 0.02 SOL posting fee.
- **Backers** send SOL to the pot and watch the tote board fill live.
- Target hit → the doer has 48h to upload video proof → reviewed within
  24h → paid the pot minus 10%.
- Target missed, no proof, proof rejected, or review missed → **every
  backer is refunded 100%, automatically.** The platform absorbs the
  network fees.

Nobody can aim a dare at anyone else. The doer originates every dare, the
pot has a hard ceiling, and dares come from a fixed category allowlist.
Those three rules are the product.

**Custody, stated plainly:** pledges sit in a platform vault wallet until a
dare settles. There is no smart-contract escrow — you are trusting the
operator, which is why every cap exists. Details: [/money](https://puhblicity.vercel.app/money).

Live at [puhblicity.vercel.app](https://puhblicity.vercel.app) ·
[@puhblicity](https://instagram.com/puhblicity)

Built with Next.js, Supabase, and `@solana/web3.js`. The full behavioral
spec is in [docs/SPEC.md](docs/SPEC.md).
