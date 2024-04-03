import React, { useState } from 'react';
import { createContext, useContext } from 'react';

type AuthContextType = {
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
};

export const AuthContext = createContext<AuthContextType>({
  isVerified: true,
  setIsVerified: () => {
    // Do nothing here intentionally
  },
});

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const T_KEY = 'auth';
  const getInitialAuth = () => {
    return localStorage.getItem(T_KEY) ?? 'true';
  };
  const [isVerified, setIsVerified] = useState(getInitialAuth);
  const value: AuthContextType = {
    isVerified: isVerified === 'true',
    setIsVerified: (value: boolean) => {
      localStorage.setItem(T_KEY, String(value));
      setIsVerified(String(value));
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
