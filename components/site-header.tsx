"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { shortWallet } from "@/lib/format";

export default function SiteHeader() {
  const { session, isAdmin, signingIn, signOut } = useAuth();
  const connect = useConnectOrSignIn();

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="site-logo">
          PUHB<em>LICITY</em>
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link href="/create" className="btn btn--flare">
            Open a dare
          </Link>
          {session ? (
            <>
              <Link href="/mine" className="btn">
                My dares
              </Link>
              {isAdmin && (
                <Link href="/admin" className="btn">
                  Admin
                </Link>
              )}
              <button className="btn btn--ghost mono" onClick={() => void signOut()} title="Sign out">
                {shortWallet(session.pubkey)} ✕
              </button>
            </>
          ) : (
            <button className="btn" onClick={connect} disabled={signingIn}>
              {signingIn ? "Signing in…" : "Connect wallet"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
