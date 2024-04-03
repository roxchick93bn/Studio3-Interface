import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AssetInfoType } from '@/global/types';

export interface ITemplateState {
  readonly templateAssets: AssetInfoType[];
  readonly previewSelectedId: number | null;
  readonly isLoading: boolean;
}

const initialState: ITemplateState = {
  templateAssets: [],
  previewSelectedId: null,
  isLoading: false,
};

const TemplateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    updatePreviewSelectedId(state, action: PayloadAction<number | null>) {
      state.previewSelectedId = action.payload;
    },
    updateTemplateAssets(state, action: PayloadAction<AssetInfoType[]>) {
      state.templateAssets = action.payload;
    },
    updateIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  updatePreviewSelectedId,
  updateTemplateAssets,
  updateIsLoading,
} = TemplateSlice.actions;

export default TemplateSlice.reducer;
