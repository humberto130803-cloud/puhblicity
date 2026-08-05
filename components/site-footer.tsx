import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p style={{ marginBottom: 12 }}>
          <Link href="/money">How the money works</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="https://instagram.com/puhblicity" target="_blank" rel="noopener noreferrer">
            @puhblicity
          </a>
        </p>
        <p>
          We hold the pot until the dare settles. We&apos;re a small operation, not a
          bank. The ceiling is 5 SOL for a reason. 18+.
        </p>
      </div>
    </footer>
  );
}
