import { getT } from "@/lib/i18n";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t.meta.offlineTitle };
}

/**
 * Served by the service worker when a page request can't reach the network.
 * Deliberately says nothing about any pot: we don't cache money state, so
 * anything shown here would be a guess.
 */
export default async function OfflinePage() {
  const { t } = await getT();
  return (
    <div className="wrap-narrow" style={{ padding: "80px 24px 90px", textAlign: "center" }}>
      <p className="eyebrow">{t.offline.eyebrow}</p>
      <h1 className="h2" style={{ margin: "12px 0 14px" }}>{t.offline.title}</h1>
      <p className="lede muted" style={{ marginBottom: 22 }}>
        {t.offline.body}
      </p>
      <a className="btn btn-primary" href="/">
        <span>{t.offline.retry}</span>
      </a>
    </div>
  );
}
