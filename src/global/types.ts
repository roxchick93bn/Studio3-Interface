export type APIRequestMethodType = 'GET' | 'POST' | 'UPDATE';

export type AssetInfoType = {
  update_timestamp: number;
  confirmation_attempts: number;
  confirmation_timestamp: number;
  confirmed: number;
  creation_timestamp: number;
  file_name: string;
  file_path: string;
  meta_file_path: string;
  thumbnail_file_path: string;
  file_size_bytes: number;
  file_type: string;
  purchase_price: number;
  purchase_type: string;
  transaction_signature: string | null;
  uid: number;
  user_uid: number;
  tab: string;
  tags: string;
  collection: string;
  owner: string;
};

export type LockedStatus = 'WALLET_REQUIRED' | 'AUTH_REQUIRED' | 'LOGGED_IN';
