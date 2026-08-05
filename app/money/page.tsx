export const metadata = { title: "How the money works — PUHBLICITY" };

export default function MoneyPage() {
  return (
    <div className="wrap">
      <div className="prose">
        <h1 className="display">How the money works</h1>

        <h2>The short version</h2>
        <p>
          A doer posts a dare and pays a 0.02 SOL posting fee. Backers send
          SOL into the pot. If the target is hit before the deadline, the doer
          has 48 hours to upload video proof. We review it within 24 hours.
          Approved: the doer gets the pot minus our 10% cut. Anything else —
          target missed, no proof, proof rejected — and every backer gets
          100% of their pledge back, automatically. We even pay the network
          fee on your refund.
        </p>

        <h2>Who holds the money</h2>
        <p>
          We do. Pledges go to a platform vault wallet and sit there until the
          dare settles. This is custodial: there is no smart contract escrow,
          and you are trusting us to settle honestly. We say this plainly
          because it&apos;s true. It&apos;s also why every dare is capped at 5 SOL, and
          why the total we&apos;ll hold across all open dares is capped too. We&apos;re
          a small operation, not a bank — the caps keep the worst case small.
        </p>

        <h2>What can happen to a pledge</h2>
        <ul>
          <li>Target hit, proof approved → it&apos;s part of the doer&apos;s payout.</li>
          <li>Target missed by the deadline → refunded in full, automatically.</li>
          <li>Proof never uploaded within 48h → refunded in full, automatically.</li>
          <li>Proof rejected → refunded in full, automatically.</li>
          <li>
            We fail to review the proof within 24h → refunded in full,
            automatically. Yes, our own lateness costs us, not you.
          </li>
          <li>Dare removed for a rule break → refunded in full, automatically.</li>
        </ul>

        <h2>What a pledge is not</h2>
        <p>
          Backing a dare buys you a video and your name on the wall. It is not
          an investment, it does not appreciate, it is not resellable, and you
          can never win money here. Payout depends on someone doing a silly
          thing on camera, never on chance.
        </p>

        <h2>The fine points</h2>
        <ul>
          <li>Pledges are final while a dare is open. Genuine mistake? Contact us — we can refund it manually while the dare is still open.</li>
          <li>Minimum pledge 0.05 SOL. Below that, refunds cost more than they return.</li>
          <li>The pledge that crosses the target counts in full, even if it overshoots.</li>
          <li>If a dare closes while your pledge is in flight, it goes straight back.</li>
          <li>Pledge from a wallet you control. Exchange withdrawals strip the tag that ties your SOL to a dare, and we can&apos;t match them.</li>
          <li>The posting fee is not refundable — it&apos;s what keeps the board from filling with junk.</li>
        </ul>
      </div>
    </div>
  );
}
