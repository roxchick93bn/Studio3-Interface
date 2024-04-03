// `dark` / `light` theme
export type ThemeType = 'dark' | 'light';

export type OpendAssetInfoType = {
  uid: number;
  file_name: string;
  file_path: string;
  thumbnail_file_path: string;
  meta_file_path: string;
  timestamp: number;
  wallet: string | null;
};
