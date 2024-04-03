import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AssetInfoType } from '@/global/types';

export interface IGalleryState {
  readonly displayedAssets: AssetInfoType[];
  readonly previewSelectedId: number | null;
  readonly isLoading: boolean;
}

const initialState: IGalleryState = {
  displayedAssets: [],
  previewSelectedId: null,
  isLoading: false,
};

const GallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    updatePreviewSelectedId(state, action: PayloadAction<number | null>) {
      state.previewSelectedId = action.payload;
    },
    updateDisplayedAssets(state, action: PayloadAction<AssetInfoType[]>) {
      state.displayedAssets = action.payload;
    },
    updateIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  updatePreviewSelectedId,
  updateDisplayedAssets,
  updateIsLoading,
} = GallerySlice.actions;

export default GallerySlice.reducer;
