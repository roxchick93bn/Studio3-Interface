/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch } from 'react-redux';

import { useUpdateOpenedAssets } from '../application/hooks';

import {
  updateTemplateAssets,
  // updateDisplayedAssetsPreview,
  // updateTemplateAssetsPreview,
  updateIsLoading,
  updatePreviewSelectedId,
} from './index';

import { useAppSelector } from '@/state/store';
import { AssetInfoType } from '@/global/types';
import { APP_API_URL } from '@/global/constants';
import useFetchAPI from '@/hooks/useFetchAPI';
import { splitFileName } from '@/global/utils';

// === displayedAssets ===

export const useTemplateAssets = () =>
  useAppSelector((state) => state.template.templateAssets) as AssetInfoType[];

function removeDuplicates(array: any[], key: string) {
  return array.filter(
    (obj: { [x: string]: any }, index: any, self: any[]) =>
      index ===
      self.findIndex((el: { [x: string]: any }) => el[key] === obj[key])
  );
}

const processName = (asset: AssetInfoType) => {
  const tmp = splitFileName(asset.file_name)[0];
  let res = '';
  if (tmp.search('-') != -1) {
    const list = tmp.split('-');
    list.map((val, ind) => {
      const tt = val.charAt(0).toUpperCase() + val.slice(1);
      if (ind == 0 && val.toLowerCase() != 'meme') res = tt;
      if (res != '') res = res + '-' + tt;
      if (ind != 0 && res == '') res = tt;
    });
    return res;
  } else return tmp;
};

export const useUpdateTemplateAssets = () => {
  const dispatch = useDispatch();
  const fetchAPI = useFetchAPI();
  // const updateOpenedAssets = useUpdateOpenedAssets();
  const updateIsLoading = useUpdateIsLoading();

  const handleUpdateTemplateAssets = async () => {
    updateIsLoading(true);
    fetchAPI(`${APP_API_URL}/list_template_assets`, 'POST')
      .then((templateAssets) => {
        const assets = [...templateAssets.data];
        const uniqueAssets = removeDuplicates(assets, 'file_name');
        uniqueAssets.sort((a, b) => (processName(a) > processName(b) ? 1 : -1));
        dispatch(updateTemplateAssets(uniqueAssets));
        updateIsLoading(false);
      })
      .catch(() => {
        updateIsLoading(false);
      });
  };

  return handleUpdateTemplateAssets;
};

// === previewSelectedId ===

export const usePreviewSelectedId = () =>
  useAppSelector((state) => state.template.previewSelectedId) as number | null;

export const useUpdatePreviewSelectedId = () => {
  const previewSelectedId = usePreviewSelectedId();
  const dispatch = useDispatch();

  return (id: number) => {
    dispatch(
      updatePreviewSelectedId(
        previewSelectedId === null ? id : previewSelectedId === id ? null : id
      )
    );
  };
};

export const usePreviewSelectedAsset = () => {
  const previewSelectedId = usePreviewSelectedId();
  const templateAssets = useTemplateAssets();
  const allAssets = [...templateAssets];

  if (!previewSelectedId) return null;
  return allAssets.filter((asset) => asset.uid === previewSelectedId)[0];
};

// === isLoading ===

export const useIsLoading = () =>
  useAppSelector((state) => state.template.isLoading) as boolean;

export const useUpdateIsLoading = () => {
  const dispatch = useDispatch();

  return (state: boolean) => {
    dispatch(updateIsLoading(state));
  };
};
