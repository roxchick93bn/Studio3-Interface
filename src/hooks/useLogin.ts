import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

import useFetchAPI from './useFetchAPI';

import { useAuth } from '@/context/AuthContext';
import { APP_API_URL, WHITE_LIST } from '@/global/constants';
import {
  useAuthToken,
  useUpdateAuthToken,
  useUpdateAuthWallet,
} from '@/state/application/hooks';
import {
  useIsAuthLoading,
  useUpdateIsAuthLoading,
  useUpdateWalletModal,
} from '@/state/solana/hooks';

export default function useLogin() {
  const { setIsVerified } = useAuth();
  const { publicKey, signMessage } = useWallet();
  const authToken = useAuthToken();
  const updateAuthToken = useUpdateAuthToken();
  const updateAuthWallet = useUpdateAuthWallet();
  const fetchAPI = useFetchAPI();
  const isAuthLoading = useIsAuthLoading();
  const updateWalletModal = useUpdateWalletModal();
  const updateIsAuthLoading = useUpdateIsAuthLoading();

  const login = async () => {
    if (authToken) return;
    if (isAuthLoading) return;
    if (!publicKey || !publicKey.toBase58())
      throw new Error('Wallet not connected!');
    // `signMessage` will be undefined if the wallet doesn't support it
    if (!signMessage)
      throw new Error('Wallet does not support message signing!');
    const timestamp = Math.floor(new Date().getTime() / 1000);
    updateIsAuthLoading(true);
    let signature;
    try {
      signature = await signMessage(
        new TextEncoder().encode(
          `Please sign this message to login to Studio 3\n\nTimestamp: ${timestamp.toString()}`
        )
      );
    } catch (error) {
      updateIsAuthLoading(false);
      return;
    }
    const address = publicKey.toBase58();
    fetchAPI(`${APP_API_URL}/login`, 'POST', {
      address,
      timestamp,
      signature: bs58.encode(signature),
    })
      .then((res) => {
        updateIsAuthLoading(false);
        if (res.success === true) {
          if (WHITE_LIST.indexOf(address) != -1) {
            setIsVerified(true);
          } else {
            setIsVerified(false);
          }
          updateAuthToken(res.data.token);
          updateAuthWallet(publicKey.toBase58());
          updateWalletModal(false);
        }
      })
      .catch(() => {
        updateIsAuthLoading(false);
      });
  };

  return login;
}
