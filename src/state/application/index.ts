import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { OpendAssetInfoType, ThemeType } from './types';

export interface IApplicationState {
  readonly theme: ThemeType;
  readonly authToken: string | null;
  readonly authWallet: string | null;
  readonly openedAssets: OpendAssetInfoType[];
}

const initialState: IApplicationState = {
  theme: 'dark',
  authToken: null,
  authWallet: null,
  openedAssets: [],
};

const ApplicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    updateAuthToken(state, action: PayloadAction<string | null>) {
      state.authToken = action.payload;
    },
    updateAuthWallet(state, action: PayloadAction<string | null>) {
      state.authWallet = action.payload;
    },
    updateOpenedAssets(state, action: PayloadAction<OpendAssetInfoType[]>) {
      state.openedAssets = action.payload;
    },
    appendOpenedAsset(state, action: PayloadAction<OpendAssetInfoType>) {
      const idx = state.openedAssets.findIndex(
        (asset) => asset.uid === action.payload.uid
      );
      if (idx === -1) {
        state.openedAssets.push(action.payload);
      } else {
        state.openedAssets[idx].timestamp = new Date().getTime();
      }
    },
    removeOpenedAsset(state, action: PayloadAction<number>) {
      const idx = state.openedAssets.findIndex(
        (asset) => asset.uid === action.payload
      );
      if (idx === -1) return;
      state.openedAssets.splice(idx, 1);
    },
  },
});

export const {
  toggleTheme,
  updateAuthToken,
  updateAuthWallet,
  appendOpenedAsset,
  removeOpenedAsset,
  updateOpenedAssets,
} = ApplicationSlice.actions;

export default ApplicationSlice.reducer;
