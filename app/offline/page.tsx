export const metadata = { title: "Offline — PUHBLICITY" };

/**
 * Served by the service worker when a page request can't reach the network.
 * Deliberately says nothing about any pot: we don't cache money state, so
 * anything shown here would be a guess.
 */
export default function OfflinePage() {
  return (
    <div className="wrap-narrow" style={{ padding: "80px 24px 90px", textAlign: "center" }}>
      <p className="eyebrow">No connection</p>
      <h1 className="h2" style={{ margin: "12px 0 14px" }}>You&apos;re offline.</h1>
      <p className="lede muted" style={{ marginBottom: 22 }}>
        Pots move in real time, so we won&apos;t show you a number we can&apos;t
        check. Nothing you&apos;ve pledged is affected — reconnect and it&apos;ll all
        be here.
      </p>
      <a className="btn btn-primary" href="/">
        <span>Try again</span>
      </a>
    </div>
  );
}
