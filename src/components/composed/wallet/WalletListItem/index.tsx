import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import React, { FC, MouseEventHandler, useMemo } from 'react';
import clsx from 'clsx';

import styles from './index.module.scss';

import Button from '@/components/based/Button';

interface IWalletListItem {
  onClick: MouseEventHandler<HTMLButtonElement>;
  wallet: Wallet;
}

const WalletListItem: FC<IWalletListItem> = ({ onClick, wallet }) => {
  const { wallet: selectedWallet } = useWallet();

  const isSelected = useMemo(() => {
    return wallet.adapter === selectedWallet?.adapter;
  }, [selectedWallet?.adapter, wallet.adapter]);

  return (
    <Button
      className={clsx(styles.item, {
        [styles.selected]: isSelected,
      })}
      onClick={onClick}
    >
      <img src={wallet.adapter.icon} alt={`${wallet.adapter.name} icon`} />
      {wallet.adapter.name}
      {isSelected && <div className={styles.badge}>Selected</div>}
    </Button>
  );
};

export default WalletListItem;
