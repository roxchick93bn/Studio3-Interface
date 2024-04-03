import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenInfo } from '@solana/spl-token-registry';

export interface ISolanaState {
  readonly tokenMap: Map<string, TokenInfo>;
  readonly walletModalOpened: boolean;
  readonly isAuthLoading: boolean;
}

const initialState: ISolanaState = {
  tokenMap: new Map(),
  walletModalOpened: false,
  isAuthLoading: false,
};

const SolanaSlice = createSlice({
  name: 'solana',
  initialState,
  reducers: {
    updateTokenMap(state, action: PayloadAction<Map<string, TokenInfo>>) {
      state.tokenMap = action.payload;
    },
    updateWalletModalOpened(state, action: PayloadAction<boolean>) {
      state.walletModalOpened = action.payload;
    },
    updateIsAuthLoading(state, action: PayloadAction<boolean>) {
      state.isAuthLoading = action.payload;
    },
  },
});

export const { updateTokenMap, updateWalletModalOpened, updateIsAuthLoading } =
  SolanaSlice.actions;

export default SolanaSlice.reducer;
