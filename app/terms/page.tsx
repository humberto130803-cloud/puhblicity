import { Rv } from "@/components/reveal";

export const metadata = { title: "Terms — PUHBLICITY" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Rv>
      <h3 className="h3" style={{ margin: "28px 0 9px" }}>{title}</h3>
      {children}
    </Rv>
  );
}

/**
 * Deliberately written as an agreement between two people rather than a
 * corporate document: no entity, no governing-law clause, no defined terms.
 * Everything here is a promise one side makes to the other, in the same
 * voice as the rest of the site.
 */
export default function TermsPage() {
  return (
    <div className="wrap-narrow" style={{ padding: "52px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">Effective August 5, 2026</p>
        <h1 className="h2" style={{ margin: "11px 0 15px" }}>The deal</h1>
        <p className="lede muted">
          This is what you agree to by using PUHBLICITY, and what we agree to
          in return. It&apos;s short because there isn&apos;t a longer version.
        </p>
      </Rv>

      <Section title="What PUHBLICITY is">
        <p>
          A board where you can offer to do something from a fixed menu, and
          other people can put SOL behind that offer. We run the board, hold
          the pot while a dare is live, and settle it when it ends. That&apos;s
          the whole service.
        </p>
      </Section>

      <Section title="Who can use it">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>You&apos;re 18 or older.</li>
          <li>You&apos;re using a wallet you control.</li>
          <li>You&apos;re not somewhere that makes any of this illegal for you. That call is yours, not ours.</li>
        </ul>
      </Section>

      <Section title="The rule the whole place is built on">
        <p>
          You dare yourself. Nobody else. There is no way to point a dare at
          another person here, and trying to smuggle one in through the text
          box gets the dare removed and every backer refunded.
        </p>
      </Section>

      <Section title="What you promise us">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>You can do your dare safely, and you won&apos;t escalate it past what the menu describes to make it more impressive.</li>
          <li>Anyone else who appears in your video agreed to be in it.</li>
          <li>Your proof is really yours, filmed for this dare, and it opens with your dare code.</li>
          <li>You won&apos;t post a dare as somebody you aren&apos;t.</li>
          <li>Nothing sexual, nothing cruel, nothing that hurts you or anyone watching.</li>
        </ul>
      </Section>

      <Section title="What we promise you">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>If a dare doesn&apos;t pay out, every backer gets 100% back. We cover the network fees.</li>
          <li>We take 10% only when a doer actually gets paid, and nothing otherwise.</li>
          <li>If we don&apos;t review a proof within 24 hours, backers are refunded automatically. Our slowness costs us, not you.</li>
          <li>We tell you plainly that we hold the pot, because we do.</li>
          <li>Proof videos come down 48 hours after payout, and we delete the file.</li>
          <li>If we reject a proof, you get a reason, not silence.</li>
        </ul>
      </Section>

      <Section title="The money">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>Posting a dare costs 0.02 SOL and that isn&apos;t refundable — it&apos;s what keeps the board clean.</li>
          <li>Pledges are final while a dare is open. Genuine mistake? Tell us and we&apos;ll sort it out.</li>
          <li>A pot can&apos;t go past 5 SOL. That ceiling is not negotiable and it exists to limit what you&apos;re trusting us with.</li>
          <li>Backing a dare is not an investment, a bet, or a purchase of anything resellable. You cannot win money here. You get a video and your name on the dare.</li>
        </ul>
      </Section>

      <Section title="What gets a dare removed">
        <p>
          Anything aimed at another person, anything outside the menu,
          anything dangerous, and anything that would make a reasonable
          person watching it uncomfortable for the wrong reasons. We can
          remove a dare at any time, and when we do, every backer is refunded
          in full.
        </p>
      </Section>

      <Section title="Risk, honestly">
        <p>
          You do your dare at your own risk. We hold your pot, which means
          you&apos;re trusting us, and no wording on this page changes that — the
          5 SOL ceiling and the automatic refunds are what actually limit it.
          If something goes wrong, the most we&apos;d ever owe you is what you
          paid us in fees.
        </p>
      </Section>

      <Section title="Changes and endings">
        <p>
          We can pause the board at any time. Pausing never stops a refund or
          a payout that&apos;s already owed. If these terms change, the change
          applies to dares posted after it, never to money already in a pot.
        </p>
      </Section>

      <Section title="Talking to us">
        <p>@puhblicity on Instagram. A real person reads it.</p>
      </Section>
    </div>
  );
}
