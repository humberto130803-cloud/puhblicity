import { Rv } from "@/components/reveal";

export const metadata = { title: "Terms — PUHBLICITY" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Rv>
      <h3 className="h3" style={{ margin: "26px 0 9px" }}>{title}</h3>
      {children}
    </Rv>
  );
}

export default function TermsPage() {
  return (
    <div className="wrap-narrow" style={{ padding: "52px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">Effective August 5, 2026</p>
        <h1 className="h2" style={{ margin: "11px 0 15px" }}>Terms</h1>
        <p className="lede muted">
          The short honest version of every clause is on the{" "}
          <a href="/money">money page</a>. This is the rest.
        </p>
      </Rv>

      <Section title="What this is">
        <p>
          PUHBLICITY is a public board where a person (the doer) offers to
          perform a harmless act from our fixed menu, and others (backers)
          fund that offer in SOL. We hold pledged funds in a platform wallet
          until the dare settles, then pay out or refund according to the
          rules on the money page, which is part of these terms.
        </p>
      </Section>

      <Section title="Who can use it">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>You must be 18 or older.</li>
          <li>
            You may not use PUHBLICITY if you are located in, or a resident
            of, a jurisdiction under comprehensive sanctions, or if you appear
            on a sanctions list. We screen best-effort and honestly admit
            screening is imperfect.
          </li>
          <li>You may only connect wallets you control.</li>
        </ul>
      </Section>

      <Section title="The one rule that defines the place">
        <p>
          Every dare is self-inflicted. You dare yourself, and only yourself.
          There is no mechanism to aim a dare at another person, and any
          attempt to smuggle one in through free text gets the dare removed
          and all pledges refunded.
        </p>
      </Section>

      <Section title="Content rules">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
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
      </Section>

      <Section title="Money">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>Posting fee: 0.02 SOL, non-refundable.</li>
          <li>Platform cut: 10% of the pot, taken only on a successful payout.</li>
          <li>Failed dares refund 100% of every pledge; we absorb network fees.</li>
          <li>Custody is ours during a dare&apos;s life: no smart-contract escrow. Per-dare and total caps limit exposure.</li>
          <li>Nothing here is an investment, a security, a wager, or a game of chance.</li>
        </ul>
      </Section>

      <Section title="Liability">
        <p>
          You perform dares at your own risk and represent that you can do so
          safely. The menu is built from acts that are embarrassing rather
          than dangerous, and you agree not to escalate them beyond what the
          category describes. To the maximum extent allowed by law, our
          liability is limited to the amounts you paid us in fees.
        </p>
      </Section>

      <Section title="Service">
        <p>
          We can pause the site at any time; pausing never blocks refunds or
          payouts already owed. We keep a full ledger of every transaction.
          These terms are governed by the laws of Panama. Contact:
          @puhblicity on Instagram.
        </p>
      </Section>
    </div>
  );
}
