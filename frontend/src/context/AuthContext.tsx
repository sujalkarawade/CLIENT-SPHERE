/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultUser: User = {
    id: 'user-default-1',
    name: 'Sujal Karawade',
    email: 'sujalkarawade18@gmail.com',
    createdAt: new Date('2026-01-15T09:00:00Z').toISOString()
  };

  const [user] = useState<User | null>(defaultUser);
  const [token] = useState<string | null>('bypass-auth-token');
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Auth bypass: always authenticated
  }, []);

  const login = async () => {
    // No-op bypass
  };

  const register = async () => {
    // No-op bypass
  };

  const logout = () => {
    // No-op bypass
  };

  const clearError = () => {
    // No-op
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be invoked from inside an AuthProvider scope');
  }
  return context;
};
