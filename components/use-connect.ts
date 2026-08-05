"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/components/providers";

/**
 * One action for every disconnected CTA. Two steps behind one button, not
 * interchangeable: no wallet → open the picker; wallet but no session →
 * sign the SIWS challenge. Ported from Ascending.
 */
export function useConnectOrSignIn(): () => void {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const { session, signIn } = useAuth();

  return useCallback(() => {
    if (!wallet.connected || !wallet.publicKey) {
      setVisible(true);
      return;
    }
    if (!session) void signIn();
  }, [wallet.connected, wallet.publicKey, setVisible, session, signIn]);
}
