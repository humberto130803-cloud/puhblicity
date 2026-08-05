import { Rv } from "@/components/reveal";

export const metadata = { title: "How the money works — PUHBLICITY" };

export default function MoneyPage() {
  return (
    <div className="wrap-narrow" style={{ padding: "52px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">No small print</p>
        <h1 className="h2" style={{ margin: "11px 0 15px" }}>How the money works</h1>
        <p className="lede muted">
          Everything on this page is the whole policy. There isn&apos;t a second
          version buried in the terms.
        </p>
      </Rv>

      <Rv className="card card-pad" style={{ margin: "32px 0" }}>
        <div className="rowline"><span>Posting a dare</span><b className="mono">0.02 SOL</b></div>
        <div className="rowline"><span>Backing a dare</span><b className="mono">Free — you only send your pledge</b></div>
        <div className="rowline"><span>Our cut if a dare pays out</span><b className="mono">10% of the pot</b></div>
        <div className="rowline"><span>Our cut if it doesn&apos;t</span><b className="mono">Nothing</b></div>
        <div className="rowline"><span>Refunds</span><b className="mono">100%, fee absorbed by us</b></div>
        <div className="rowline"><span>Smallest pledge</span><span className="mono">0.05 SOL</span></div>
        <div className="rowline"><span>Biggest a pot can get</span><span className="mono">5.00 SOL</span></div>
      </Rv>

      <Rv>
        <h3 className="h3" style={{ marginBottom: 9 }}>Who holds the money</h3>
        <p style={{ marginBottom: 24 }}>
          We do. Pledges go to one wallet we control and sit there until the
          dare settles, then they go to the doer or back to you. That means
          you&apos;re trusting us, and we&apos;d rather say so than dress it up. There&apos;s
          no smart contract here and we won&apos;t pretend otherwise. The 5 SOL
          ceiling exists to keep the amount you&apos;re trusting us with small.
        </p>
      </Rv>

      <Rv>
        <h3 className="h3" style={{ marginBottom: 9 }}>When you get refunded</h3>
        <p style={{ marginBottom: 9 }}>Automatically, in full, in every one of these cases:</p>
        <ul style={{ margin: "0 0 24px 22px", lineHeight: 1.8 }}>
          <li>The dare misses its target by the deadline.</li>
          <li>The doer doesn&apos;t send proof within 48 hours.</li>
          <li>We reject the proof.</li>
          <li>
            We haven&apos;t reviewed the proof within 24 hours of it arriving.
            That one&apos;s on us, and you shouldn&apos;t have to wait for us to wake up.
          </li>
          <li>We remove the dare for breaking the rules.</li>
          <li>Your pledge lands after funding closed.</li>
        </ul>
      </Rv>

      <Rv>
        <h3 className="h3" style={{ marginBottom: 9 }}>What backing is not</h3>
        <p style={{ marginBottom: 24 }}>
          It isn&apos;t an investment, a bet, or a purchase of anything that can be
          resold. Nothing you back can gain value. There&apos;s no chance involved —
          a dare pays out because someone did the thing, not because a number
          came up. What you get is the video, watchable for 48 hours after
          payout, and your name on the dare.
        </p>
      </Rv>

      <Rv>
        <h3 className="h3" style={{ marginBottom: 9 }}>How we know they really did it</h3>
        <p style={{ marginBottom: 24 }}>
          Every proof video has to open with the dare&apos;s own code — an
          eight-character string that didn&apos;t exist before the dare was
          funded. Said out loud or held up, in the first few seconds. That
          makes a recycled or downloaded video almost impossible to pass off,
          and it means a human can check it in seconds. The dares themselves
          are chosen to be hard to fake too: strangers have to react, or it&apos;s
          one unbroken take, or it leaves something anyone can check
          afterwards.
        </p>
      </Rv>

      <Rv>
        <h3 className="h3" style={{ marginBottom: 9 }}>A few things that will save you money</h3>
        <ul style={{ margin: "0 0 24px 22px", lineHeight: 1.8 }}>
          <li>Pledge from your own wallet. Sends from an exchange lose the tag and we can&apos;t match them to a dare.</li>
          <li>Doers: connect the wallet you want paid into. Not an exchange deposit address.</li>
          <li>Pledges are final while a dare is open. Made a genuine mistake? Message us — we&apos;d rather fix it than argue.</li>
        </ul>
      </Rv>

      <Rv className="notice">
        <b>18+.</b> Doers post their own dares and nobody else&apos;s. Nothing
        involving heights, vehicles, fire, weapons, alcohol, drugs, or anyone
        who hasn&apos;t agreed to appear. We remove dares that break this and
        refund every backer.
      </Rv>
    </div>
  );
}
