"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { shortWallet } from "@/lib/format";

export default function SiteHeader({ dark = false }: { dark?: boolean }) {
  const { session, isAdmin, signingIn, signOut } = useAuth();
  const connect = useConnectOrSignIn();

  return (
    <header className={`topbar${dark ? " on-dark" : ""}`}>
      <div className="wrap">
        <Link className="brand" href="/">
          <em></em>PUHBLICITY
        </Link>
        <nav className="topnav" aria-label="Main">
          <Link href="/">The board</Link>
          <Link href="/money">How the money works</Link>
          {session && <Link href="/mine">My dares</Link>}
          {session && isAdmin && <Link href="/admin">Admin</Link>}
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
              <span>{signingIn ? "Signing in…" : "Connect wallet"}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
