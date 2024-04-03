export const MAINNET_CHAIN_ID = 101;

export const TOKEN_LIST = [
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ', // DUST
];

export const WHITE_LIST = [
  '53VqXqwTEK5MNJPqxu3yEUBHpo78vMoHt1vZpjVThnps',
  '6Dio27qRnsTFaFUwAshonT82FS1d3C9uA9WvyyQXyuro',
  'C8VSZEcAUXNKTEvtfRztREXt1fT5Rf3tAvNaumvuc8Li',
  '6zBaDY9LG2DMotrjdfJfJ6w8aLA7YqSV4jm6V7JWgabC',
  '5HoATg69fVLTFm7ypSWZTfHNyhQAgPZmYKsh2e5jvtqv',
];

// export const APP_API_URL = 'http://127.0.0.1:8081';
export const APP_API_URL = 'https://api.studio-3.xyz';

export const APP_ASSET_URL =
  'https://d3-studio-assets.s3.us-east-2.amazonaws.com/';

// TODO: this is likely not the best way to check if a design is a template - this UID may change
export const TEMPLATE_USER_ID = 5574987670839803000;

export const CONFIRM_MODAL_INFO = {
  DELETE: {
    title: 'Design Deletion Confirmation',
    content:
      'Are you sure you want to delete this design? This action cannot be undone.',
    submit: 'Delete',
  },
  DUPLICATE: {
    title: 'Design Duplication Confirmation',
    content:
      'Are you sure you want to duplicate this design? This will create a new file in your library with the exact same design.',
    submit: 'Duplicate',
  },
  DOWNLOAD: {
    title: 'Select Download Type',
    content: 'Please select method to download this image',
    submit: 'OK',
  },
};

type SelectOptionType = {
  value: string;
  data: string;
};

export const TEMPLATE_COLLECTION = {
  Tab: [
    { value: 'None', data: 'None' },
    {
      value: 'Meme',
      data: 'Meme',
    },
    {
      value: 'Merch',
      data: 'Merch',
    },
    {
      value: 'Collection',
      data: 'Collection',
    },
  ],
  Tags: [
    {
      value: 'value',
      data: 'data',
    },
  ],
  Collection: [
    { value: 'None', data: 'None' },
    {
      value: 'Alpha Pharaohs',
      data: 'Alpha Pharaohs',
    },
    {
      value: 'Anon',
      data: 'Anon',
    },
    {
      value: 'Aptos Monkeys',
      data: 'Aptos Monkeys',
    },
    { value: 'Azuki', data: 'Azuki' },
    { value: 'Bitcoin Bandits', data: 'Bitcoin Bandits' },
    { value: 'Bitcoin Frogs', data: 'Bitcoin Frogs' },
    {
      value: 'Bonkz',
      data: 'Bonkz',
    },
    {
      value: 'Clayno',
      data: 'Clayno',
    },
    { value: 'Coin Hunter', data: 'Coin Hunter' },
    {
      value: 'Dandies',
      data: 'Dandies',
    },
    {
      value: 'DeFi Apes',
      data: 'DeFi Apes',
    },
    {
      value: 'Famous Foxes',
      data: 'Famous Foxes',
    },
    {
      value: 'Fuddies',
      data: 'Fuddies',
    },
    {
      value: 'GhostKidDAO',
      data: 'GhostKidDAO',
    },
    {
      value: 'Gods',
      data: 'Gods',
    },
    {
      value: 'Jelly Rascals',
      data: 'Jelly Rascals',
    },
    {
      value: 'Jikan',
      data: 'Jikan',
    },
    {
      value: 'Liberty Square',
      data: 'Liberty Square',
    },
    {
      value: 'Lily',
      data: 'Lily',
    },
    {
      value: 'Mad Lads',
      data: 'Mad Lads',
    },
    { value: 'MonkeDAO', data: 'MonkeDAO' },
    { value: 'Nakamigos', data: 'Nakamigos' },
    { value: 'Nekozuma', data: 'Nekozuma' },
    {
      value: 'Network',
      data: 'Network',
    },
    {
      value: 'Okay Bears',
      data: 'Okay Bears',
    },
    {
      value: 'Oogy',
      data: 'Oogy',
    },
    {
      value: 'Ordinals',
      data: 'Ordinals',
    },
    {
      value: 'Pepe',
      data: 'Pepe',
    },
    {
      value: 'Plato',
      data: 'Plato',
    },
    {
      value: 'Sharx',
      data: 'Sharx',
    },
    {
      value: 'Smyths',
      data: 'Smyths',
    },
    {
      value: 'Solana',
      data: 'Solana',
    },
    {
      value: 'Stoned Apes',
      data: 'Stoned Apes',
    },
    { value: 'Taiyo', data: 'Taiyo' },
    {
      value: 'Wolf Capital',
      data: 'Wolf Capital',
    },
    { value: 'Your Fav Influencer', data: 'Your Fav Influencer' },
  ],
} as { [key: string]: SelectOptionType[] };
