import React, { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Phantom } from '@solana-suite/phantom';

import { updateAuthWallet } from './state/application';
import { AuthProvider, useAuth } from './context/AuthContext';
import UploadPage from './pages/Upload';

import { LockedStatus } from '@/global/types';
import { APP_ROUTES, DEFAULT_ROUTE } from '@/config/routes';
import PageLayout from '@/components/navigation/PageLayout';
import LockScreen from '@/components/navigation/LockScreen';
import { useUpdateTokenMap } from '@/state/solana/hooks';
import {
  useAuthToken,
  useAuthWallet,
  useUpdateAuthToken,
} from '@/state/application/hooks';

import '@pqina/pintura/pintura.css';
import '@/assets/styles/pintura.scss';
import 'react-lazy-load-image-component/src/effects/blur.css';

declare global {
  interface Window {
    solana: Phantom;
  }
  interface NavigateOptions {
    state: {
      warning?: string;
      error?: string;
      mint?: string;
    };
  }
}

export default function App() {
  const { isVerified } = useAuth();
  const authToken = useAuthToken();
  const authWallet = useAuthWallet();
  const { publicKey, wallet } = useWallet();
  const updateAuthToken = useUpdateAuthToken();

  const lockedStatus: LockedStatus = useMemo(() => {
    if (!wallet) return 'WALLET_REQUIRED';
    if (!authToken) return 'AUTH_REQUIRED';
    return 'LOGGED_IN';
  }, [authToken, wallet]);

  useEffect(() => {
    if (publicKey && authWallet !== publicKey.toBase58() && authToken) {
      window.location.reload();
      updateAuthToken(null);
      updateAuthWallet(publicKey.toBase58());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, authWallet]);

  useUpdateTokenMap();

  return (
    <AuthProvider>
      <PageLayout>
        <LockScreen status={lockedStatus} />
        <Routes>
          {APP_ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.component}
            />
          ))}
          {isVerified == true ? (
            <Route key="/upload" path="/upload" element={<UploadPage />} />
          ) : (
            <></>
          )}
          <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
        </Routes>
      </PageLayout>
    </AuthProvider>
  );
}
