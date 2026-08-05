"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import type { SolanaSignInInput } from "@solana/wallet-standard-features";
import { createSignInMessageText } from "@solana/wallet-standard-util";
import bs58 from "bs58";
import { WalletHandoff } from "@/components/wallet-handoff";
import { AuthError } from "@/components/auth-error";
import "@solana/wallet-adapter-react-ui/styles.css";

const ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.mainnet-beta.solana.com";

// ---------------------------------------------------------------------------
// Auth context — the Sign-In-With-Solana handshake, ported from Ascending.
// ---------------------------------------------------------------------------

type Session = { pubkey: string };

type AuthContextValue = {
  /** null = signed out; undefined = still loading */
  session: Session | null | undefined;
  isAdmin: boolean;
  signingIn: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Ask the user to continue inside a wallet's in-app browser (mobile). */
  requestWalletApp: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <Providers>");
  return ctx;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setSession(d.session ?? null);
        setIsAdmin(!!d.isAdmin);
      })
      .catch(() => setSession(null));
  }, []);

  // If a *different* wallet connects than the one in the session, sign out.
  useEffect(() => {
    if (
      session &&
      wallet.connected &&
      wallet.publicKey &&
      wallet.publicKey.toBase58() !== session.pubkey
    ) {
      fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        setSession(null);
        setIsAdmin(false);
      });
    }
  }, [session, wallet.connected, wallet.publicKey]);

  const signIn = useCallback(async () => {
    setError(null);
    setSigningIn(true);
    try {
      const nonceRes = await fetch("/api/auth/nonce", { method: "POST" });
      if (!nonceRes.ok) throw new Error("Could not get sign-in challenge");
      const input: SolanaSignInInput = await nonceRes.json();

      let account: string;
      let signature: string;
      let signedMessage: string;

      if (wallet.signIn) {
        const output = await wallet.signIn(input);
        account = bs58.encode(new Uint8Array(output.account.publicKey));
        signature = bs58.encode(new Uint8Array(output.signature));
        signedMessage = bs58.encode(new Uint8Array(output.signedMessage));
      } else if (wallet.publicKey && wallet.signMessage) {
        const address = wallet.publicKey.toBase58();
        const text = createSignInMessageText({
          ...input,
          address,
          domain: input.domain ?? window.location.host,
        });
        const msgBytes = new TextEncoder().encode(text);
        const sigBytes = await wallet.signMessage(msgBytes);
        account = address;
        signature = bs58.encode(sigBytes);
        signedMessage = bs58.encode(msgBytes);
      } else {
        throw new Error("Connect a wallet that supports message signing");
      }

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, account, signature, signedMessage }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(data.error ?? "Sign-in failed");

      setSession({ pubkey: data.pubkey });
      const me = await fetch("/api/auth/me").then((r) => r.json());
      setIsAdmin(!!me.isAdmin);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  }, [wallet]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setSession(null);
    setIsAdmin(false);
    await wallet.disconnect().catch(() => {});
  }, [wallet]);

  const [handoff, setHandoff] = useState(false);
  const requestWalletApp = useCallback(() => setHandoff(true), []);

  const value = useMemo(
    () => ({ session, isAdmin, signingIn, error, signIn, signOut, requestWalletApp }),
    [session, isAdmin, signingIn, error, signIn, signOut, requestWalletApp]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {handoff && <WalletHandoff onClose={() => setHandoff(false)} />}
      {error && <AuthError error={error} onDismiss={() => setError(null)} />}
    </AuthContext.Provider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  // Empty list: any Wallet Standard wallet (Phantom, Solflare, Backpack)
  // registers itself.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider
      endpoint={ENDPOINT}
      config={{ commitment: "confirmed", disableRetryOnRateLimit: true }}
    >
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>{children}</AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
