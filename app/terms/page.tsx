export const metadata = { title: "Terms — PUHBLICITY" };

export default function TermsPage() {
  return (
    <div className="wrap">
      <div className="prose">
        <h1 className="display">Terms</h1>
        <p className="eyebrow">Effective August 5, 2026</p>

        <h2>What this is</h2>
        <p>
          PUHBLICITY is a public board where a person (the doer) offers to
          perform a harmless act from our fixed menu, and others (backers)
          fund that offer in SOL. We hold pledged funds in a platform wallet
          until the dare settles, then pay out or refund according to the
          rules on the &ldquo;How the money works&rdquo; page, which is part of these
          terms.
        </p>

        <h2>Who can use it</h2>
        <ul>
          <li>You must be 18 or older.</li>
          <li>
            You may not use PUHBLICITY if you are located in, or a resident
            of, a jurisdiction subject to comprehensive sanctions, or if you
            appear on a sanctions list. We screen best-effort and honestly
            admit screening is imperfect.
          </li>
          <li>You may only connect wallets you control.</li>
        </ul>

        <h2>The one rule that defines the place</h2>
        <p>
          Every dare is self-inflicted. You dare yourself, and only yourself.
          There is no mechanism to aim a dare at another person, and any
          attempt to smuggle one in through free text gets the dare removed
          and all pledges refunded.
        </p>

        <h2>Content rules</h2>
        <ul>
          <li>Dares come from our fixed category menu only.</li>
          <li>
            Nothing involving danger (heights, vehicles, fire, weapons, water
            beyond a plunge tub), alcohol, drugs, sexual content, animals,
            minors, self-harm, more than a single serving of any consumable,
            or any non-consenting third party.
          </li>
          <li>Proof videos must show only people who agreed to be in them.</li>
          <li>We may remove any dare at our discretion; removal refunds all pledges in full.</li>
        </ul>

        <h2>Money</h2>
        <ul>
          <li>Posting fee: 0.02 SOL, non-refundable.</li>
          <li>Platform cut: 10% of the pot, taken only on a successful payout.</li>
          <li>Failed dares refund 100% of every pledge; we absorb network fees.</li>
          <li>Custody is ours during a dare&apos;s life: no smart contract escrow. Per-dare and total caps limit exposure.</li>
          <li>Nothing here is an investment, a security, a wager, or a game of chance.</li>
        </ul>

        <h2>Liability</h2>
        <p>
          You perform dares at your own risk and represent that you can do so
          safely. The menu is built from acts that are embarrassing rather
          than dangerous, and you agree not to escalate them beyond what the
          category describes. To the maximum extent allowed by law, our
          liability is limited to the amounts you paid us in fees.
        </p>

        <h2>Service</h2>
        <p>
          We can pause the site at any time; pausing never blocks refunds or
          payouts already owed. We keep a full ledger of every transaction.
          These terms are governed by the laws of Panama.
        </p>

        <h2>Contact</h2>
        <p>@puhblicity on Instagram.</p>
      </div>
    </div>
  );
}
