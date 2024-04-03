/* eslint-disable react-hooks/exhaustive-deps */
import clsx from 'clsx';
import React, { FC, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PuffLoader } from 'react-spinners';

import styles from './index.module.scss';

import { LockedStatus } from '@/global/types';
import {
  useUpdateWalletModal,
  useWalletModalOpened,
} from '@/state/solana/hooks';
import useLogin from '@/hooks/useLogin';
import { useAuthWallet } from '@/state/application/hooks';
import Button from '@/components/based/Button';

interface ILockScreen {
  status: LockedStatus;
}

const LockScreen: FC<ILockScreen> = ({ status }) => {
  const { publicKey } = useWallet();
  const walletModalOpened = useWalletModalOpened();
  const updateWalletModal = useUpdateWalletModal();
  const authWallet = useAuthWallet();
  const login = useLogin();

  useEffect(() => {
    if (
      status === 'WALLET_REQUIRED' &&
      !publicKey &&
      !walletModalOpened &&
      !authWallet
    ) {
      updateWalletModal(true);
      return;
    }
  }, [status, publicKey, authWallet, walletModalOpened]);

  const handleVerify = () => {
    login();
  };

  return (
    <div
      className={clsx(styles.screen, {
        [styles.locked]: status !== 'LOGGED_IN',
      })}
    >
      <PuffLoader color="#fff" />
      Authenticating ...
      <Button className={styles.verify} onClick={handleVerify}>
        Verify login
      </Button>
    </div>
  );
};

export default LockScreen;
