import Link from "next/link";
import { getT } from "@/lib/i18n";

export default async function SiteFooter() {
  const { t } = await getT();
  return (
    <footer className="foot">
      <div className="wrap">
        <div>
          <span className="brand">
            <em></em>PUHBLICITY
          </span>
          <p className="small" style={{ maxWidth: "36ch", marginTop: 12, color: "rgba(255,255,255,.6)" }}>
            {t.footer.blurb}
          </p>
        </div>
        <div>
          <Link href="/money">{t.nav.money}</Link>
          <Link href="/terms">{t.footer.terms}</Link>
          <Link href="/privacy">{t.footer.privacy}</Link>
          <a href="https://instagram.com/puhblicity" target="_blank" rel="noopener noreferrer">
            @puhblicity
          </a>
        </div>
      </div>
    </footer>
  );
}
