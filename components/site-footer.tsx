import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div>
          <span className="brand">
            <em></em>PUHBLICITY
          </span>
          <p className="small" style={{ maxWidth: "36ch", marginTop: 12, color: "rgba(255,255,255,.6)" }}>
            We hold the pot until a dare settles. We&apos;re a small operation, not
            a bank. The 5 SOL ceiling is there for a reason. 18+.
          </p>
        </div>
        <div>
          <Link href="/money">How the money works</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="https://instagram.com/puhblicity" target="_blank" rel="noopener noreferrer">
            @puhblicity
          </a>
        </div>
      </div>
    </footer>
  );
}
