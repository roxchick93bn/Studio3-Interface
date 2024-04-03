/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch } from 'react-redux';

import { useUpdateOpenedAssets } from '../application/hooks';

import {
  updateDisplayedAssets,
  // updateDisplayedAssetsPreview,
  // updateTemplateAssetsPreview,
  updateIsLoading,
  updatePreviewSelectedId,
} from './index';

import { useAppSelector } from '@/state/store';
import { AssetInfoType } from '@/global/types';
import { APP_API_URL } from '@/global/constants';
import useFetchAPI from '@/hooks/useFetchAPI';

// === displayedAssets ===

interface Point {
  pX: number;
  pY: number;
}

interface Selection {
  isSelected: boolean;
  position: Point;
}

export const useDisplayedAssets = () =>
  useAppSelector((state) => state.gallery.displayedAssets) as AssetInfoType[];

export const useUpdateDisplayedAssets = () => {
  const dispatch = useDispatch();
  const fetchAPI = useFetchAPI();
  const updateOpenedAssets = useUpdateOpenedAssets();
  const updateIsLoading = useUpdateIsLoading();

  const handleUpdateTemplateAssets = () => {
    updateIsLoading(true);
    fetchAPI(`${APP_API_URL}/list_assets`, 'POST')
      .then((listedAssets) => {
        const assets = [...listedAssets.data];
        // const uniqueAssets = removeDuplicates(assets, 'file_name');
        assets.sort((a, b) => (a.file_name > b.file_name ? 1 : -1));
        dispatch(updateDisplayedAssets(assets));
        updateOpenedAssets(assets);
        updateIsLoading(false);
      })
      .catch(() => {
        updateIsLoading(false);
      });
  };

  return handleUpdateTemplateAssets;
};

function removeDuplicates(array: any[], key: string) {
  return array.filter(
    (obj: { [x: string]: any }, index: any, self: any[]) =>
      index ===
      self.findIndex((el: { [x: string]: any }) => el[key] === obj[key])
  );
}

// === previewSelectedId ===

export const usePreviewSelectedId = () =>
  useAppSelector((state) => state.gallery.previewSelectedId) as number | null;

export const useUpdatePreviewSelectedId = () => {
  const previewSelectedId = usePreviewSelectedId();
  const dispatch = useDispatch();

  return (id: number) => {
    dispatch(
      updatePreviewSelectedId(
        previewSelectedId === null ? id : previewSelectedId === id ? id : id
      )
    );
  };
};

export const usePreviewSelectedAsset = () => {
  const previewSelectedId = usePreviewSelectedId();
  const displayedAssets = useDisplayedAssets();
  const allAssets = [...displayedAssets];

  if (!previewSelectedId) return null;
  return allAssets.filter((asset) => asset.uid === previewSelectedId)[0];
};

export const countSelected = (selectionArray: Selection[]) => {
  return selectionArray.reduce((count, selection) => {
    if (selection.isSelected) {
      count++;
    }
    return count;
  }, 0);
};
// === isLoading ===

export const useIsLoading = () =>
  useAppSelector((state) => state.gallery.isLoading) as boolean;

export const useUpdateIsLoading = () => {
  const dispatch = useDispatch();

  return (state: boolean) => {
    dispatch(updateIsLoading(state));
  };
};
