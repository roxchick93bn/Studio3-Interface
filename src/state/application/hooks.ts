/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { useDisplayedAssets } from '../gallery/hooks';

import {
  appendOpenedAsset,
  removeOpenedAsset,
  toggleTheme,
  updateAuthToken,
  updateAuthWallet,
  updateOpenedAssets,
} from './index';
import { OpendAssetInfoType, ThemeType } from './types';

import { useAppSelector } from '@/state/store';
import { AssetInfoType } from '@/global/types';

// === theme ===

export const useTheme = () =>
  useAppSelector((state) => state.application.theme) as ThemeType;

export const useToggleTheme = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    dispatch(toggleTheme());
  };
};

// === authToken ===

export const useAuthToken = () =>
  useAppSelector((state) => state.application.authToken) as string | null;

export const useUpdateAuthToken = () => {
  const dispatch = useDispatch();

  return (authToken: string | null) => {
    dispatch(updateAuthToken(authToken));
  };
};

// === authWallet ===

export const useAuthWallet = () =>
  useAppSelector((state) => state.application.authWallet) as string | null;

export const useUpdateAuthWallet = () => {
  const dispatch = useDispatch();

  return (authWallet: string | null) => {
    dispatch(updateAuthWallet(authWallet));
  };
};

// === openedAssets ===

export const useOpenedAssets = () => {
  const { publicKey } = useWallet();
  const assets = [
    ...(useAppSelector(
      (state) => state.application.openedAssets
    ) as OpendAssetInfoType[]),
  ];
  return assets
    .filter((asset) => asset.wallet === publicKey?.toBase58())
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const useClearOpenedAssets = () => {
  const dispatch = useDispatch();

  return () => {
    dispatch(updateOpenedAssets([]));
  };
};

export const useUpdateOpenedAssets = () => {
  const dispatch = useDispatch();
  const { publicKey } = useWallet();
  const opendAssets = useOpenedAssets();

  return (assets: AssetInfoType[]) => {
    const assetIdxs = opendAssets.map((opAsset) =>
      assets.findIndex((asset) => opAsset.uid === asset.uid)
    );
    if (assetIdxs.length)
      dispatch(
        updateOpenedAssets(
          opendAssets.map((asset, idx) => ({
            uid: asset.uid,
            file_name: assets[assetIdxs[idx]].file_name,
            file_path: assets[assetIdxs[idx]].file_path,
            thumbnail_file_path: assets[assetIdxs[idx]].thumbnail_file_path,
            meta_file_path: assets[assetIdxs[idx]].meta_file_path,
            timestamp: asset.timestamp,
            wallet: publicKey?.toBase58() ?? null,
          }))
        )
      );
  };
};

export const useAppendOpenedAsset = () => {
  const dispatch = useDispatch();
  const { publicKey } = useWallet();
  const assets = useDisplayedAssets();

  return (assetId: number) => {
    const openedAssets = assets.filter((asset) => asset.uid === assetId);
    if (openedAssets.length)
      dispatch(
        appendOpenedAsset({
          uid: openedAssets[0].uid,
          file_name: openedAssets[0].file_name,
          file_path: openedAssets[0].file_path,
          thumbnail_file_path: openedAssets[0].thumbnail_file_path,
          meta_file_path: openedAssets[0].meta_file_path,
          timestamp: new Date().getTime(),
          wallet: publicKey?.toBase58() ?? null,
        })
      );
  };
};

export const useRemoveOpenedAsset = () => {
  const dispatch = useDispatch();
  const { publicKey } = useWallet();
  const assets = useOpenedAssets();

  return (assetId: number) => {
    if (!publicKey) return;
    const idx = assets.findIndex(
      (asset) => asset.uid === assetId && asset.wallet === publicKey.toBase58()
    );
    if (idx === -1) return;
    dispatch(removeOpenedAsset(assetId));
  };
};
