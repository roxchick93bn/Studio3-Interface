/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';

import { useAppSelector } from '../store';

import {
  updateIsAuthLoading,
  updateTokenMap,
  updateWalletModalOpened,
} from './index';

import { MAINNET_CHAIN_ID } from '@/global/constants';

// === tokenMap ===

export const useTokenMap = () =>
  useAppSelector((state) => state.solana.tokenMap) as Map<string, TokenInfo>;

export const useUpdateTokenMap = () => {
  const dispatch = useDispatch();

  const updateTokens = () => {
    new TokenListProvider().resolve().then((tokens) => {
      const tokenList = tokens.filterByChainId(MAINNET_CHAIN_ID).getList();

      dispatch(
        updateTokenMap(
          tokenList.reduce((map, item) => {
            map.set(item.address, item);
            return map;
          }, new Map())
        )
      );
    });
  };

  useEffect(() => {
    updateTokens();
  }, []);

  return updateTokens;
};

// === walletModalOpened ===

export const useWalletModalOpened = () =>
  useAppSelector((state) => state.solana.walletModalOpened) as boolean;

export const useUpdateWalletModal = () => {
  const dispatch = useDispatch();

  return (status: boolean) => {
    dispatch(updateWalletModalOpened(status));
  };
};

export const useToggleWalletModal = () => {
  const walletModalOpened = useWalletModalOpened();
  const updateWalletModal = useUpdateWalletModal();

  return () => {
    updateWalletModal(!walletModalOpened);
  };
};

// === isAuthLoading ===

export const useIsAuthLoading = () =>
  useAppSelector((state) => state.solana.isAuthLoading) as boolean;

export const useUpdateIsAuthLoading = () => {
  const dispatch = useDispatch();

  return (status: boolean) => {
    dispatch(updateIsAuthLoading(status));
  };
};
