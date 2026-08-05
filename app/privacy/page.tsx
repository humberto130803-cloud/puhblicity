import { Rv } from "@/components/reveal";

export const metadata = { title: "Privacy — PUHBLICITY" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Rv>
      <h3 className="h3" style={{ margin: "26px 0 9px" }}>{title}</h3>
      {children}
    </Rv>
  );
}

export default function PrivacyPage() {
  return (
    <div className="wrap-narrow" style={{ padding: "52px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">Effective August 5, 2026</p>
        <h1 className="h2" style={{ margin: "11px 0 15px" }}>Privacy</h1>
        <p className="lede muted">
          No email, no phone, no tracking pixels, no ad tech. Your wallet is
          your identity here, and that&apos;s all we ask for.
        </p>
      </Rv>

      <Section title="What we collect">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>Wallet addresses.</li>
          <li>The dares you post and the pledges you make — these are also public on Solana itself, which we don&apos;t control.</li>
          <li>The display name, optional Instagram handle, and notes you choose to post.</li>
          <li>Proof videos you upload.</li>
        </ul>
      </Section>

      <Section title="How wallet addresses appear">
        <p>
          Public pages show truncated addresses only. Full addresses live in
          our database and on-chain, where they were always public.
        </p>
      </Section>

      <Section title="Proof videos">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>Stored in a private bucket; served only through short-lived signed links.</li>
          <li>Before payout, only you and the reviewer can watch.</li>
          <li>After payout, the video is viewable on the dare page — backers paid to see it, and you were told this at upload.</li>
          <li>
            <b>Right to erasure:</b> after payout you can ask us to delete
            your video, and we will. The dare record and its outcome stay;
            the file goes.
          </li>
        </ul>
      </Section>

      <Section title="What we never do">
        <ul style={{ margin: "0 0 0 22px", lineHeight: 1.8 }}>
          <li>Sell or share your data with anyone.</li>
          <li>Make a proof video public before its dare is paid.</li>
          <li>Keep copies of a deleted video.</li>
        </ul>
      </Section>

      <Section title="The permanent parts">
        <p>
          SOL transfers are public and permanent on Solana — pledges, refunds
          and payouts are all visible on-chain forever. That&apos;s the nature of
          the rails, not a choice of ours. Contact: @puhblicity on Instagram.
        </p>
      </Section>
    </div>
  );
}
