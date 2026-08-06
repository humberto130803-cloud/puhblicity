"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { useT } from "@/components/locale-provider";
import { LangToggle } from "@/components/lang-toggle";
import { shortWallet } from "@/lib/format";

export default function SiteHeader({ dark = false }: { dark?: boolean }) {
  const { session, isAdmin, signingIn, signOut } = useAuth();
  const connect = useConnectOrSignIn();
  const t = useT();

  return (
    <header className={`topbar${dark ? " on-dark" : ""}`}>
      <div className="wrap">
        <Link className="brand" href="/">
          <em></em>PUHBLICITY
        </Link>
        <nav className="topnav" aria-label="Main">
          <Link href="/">{t.nav.board}</Link>
          <Link href="/money">{t.nav.money}</Link>
          {session && <Link href="/mine">{t.nav.mine}</Link>}
          {session && isAdmin && <Link href="/admin">{t.nav.admin}</Link>}
          <LangToggle dark={dark} />
          {session ? (
            <button
              className={`btn btn-sm ${dark ? "on-dark-btn" : "btn-dark"} mono`}
              onClick={() => void signOut()}
              title="Sign out"
            >
              <span>{shortWallet(session.pubkey)}</span>
            </button>
          ) : (
            <button
              className={`btn btn-sm ${dark ? "on-dark-btn" : "btn-dark"}`}
              onClick={connect}
              disabled={signingIn}
            >
              <span>{signingIn ? t.nav.signingIn : t.nav.connect}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
