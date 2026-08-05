export const metadata = { title: "Privacy — PUHBLICITY" };

export default function PrivacyPage() {
  return (
    <div className="wrap">
      <div className="prose">
        <h1 className="display">Privacy</h1>
        <p className="eyebrow">Effective August 5, 2026</p>

        <h2>What we collect</h2>
        <ul>
          <li>Wallet addresses — yours is your identity here.</li>
          <li>The dares you post and the pledges you make (these are also public on the Solana blockchain, which we don&apos;t control).</li>
          <li>The display name, optional Instagram handle, and free-text notes you choose to post.</li>
          <li>Proof videos you upload.</li>
        </ul>
        <p>No email, no phone, no tracking pixels, no ad tech.</p>

        <h2>How wallet addresses appear</h2>
        <p>
          Public pages show truncated addresses only. Full addresses live in
          our database and on-chain (where they were always public).
        </p>

        <h2>Proof videos</h2>
        <ul>
          <li>Stored in a private bucket; served only through short-lived signed links.</li>
          <li>Before payout, only you and the reviewer can watch.</li>
          <li>After payout, the video is viewable on the dare page — backers paid to see it, and you were told this at upload.</li>
          <li>
            Right to erasure: after payout you can ask us to delete your
            video, and we will. The dare record and its outcome stay; the
            file goes.
          </li>
        </ul>

        <h2>What we never do</h2>
        <ul>
          <li>Sell or share your data with anyone.</li>
          <li>Make a proof video public before its dare is paid.</li>
          <li>Keep a deleted video&apos;s copies around.</li>
        </ul>

        <h2>The permanent parts</h2>
        <p>
          SOL transfers are public and permanent on Solana — refunds, payouts
          and pledges are all visible on-chain forever. That&apos;s the nature of
          the rails, not a choice of ours.
        </p>

        <h2>Contact</h2>
        <p>@puhblicity on Instagram.</p>
      </div>
    </div>
  );
}
