"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useAuth } from "@/components/providers";
import { hasInjectedWallet, isMobile } from "@/components/wallet-env";

/**
 * One action for every CTA that needs a signed-in wallet.
 *
 * Three worlds, and picking the wrong one is how a phone user hits a dead
 * end:
 *
 *   1. No wallet reachable at all (phone browser, no extension exists) →
 *      hand off to the wallet's in-app browser. Opening the adapter's modal
 *      here shows an empty picker, which reads as "this site is broken".
 *   2. Wallet present but not connected → open the picker.
 *   3. Connected but no session → sign the SIWS challenge.
 */
export function useConnectOrSignIn(): () => void {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const { session, signIn, requestWalletApp } = useAuth();

  return useCallback(() => {
    if (!wallet.connected || !wallet.publicKey) {
      // Count only wallets that could actually sign. `wallets` is NOT empty
      // when nothing is installed — it carries entries in a NotDetected
      // state, which is why a length check silently opened an empty picker.
      const usable = wallet.wallets.some(
        (w) =>
          w.readyState === WalletReadyState.Installed ||
          w.readyState === WalletReadyState.Loadable
      );
      const reachable = usable || hasInjectedWallet();
      if (!reachable && isMobile()) {
        requestWalletApp();
        return;
      }
      setVisible(true);
      return;
    }
    if (!session) void signIn();
  }, [
    wallet.connected,
    wallet.publicKey,
    wallet.wallets,
    setVisible,
    session,
    signIn,
    requestWalletApp,
  ]);
}
