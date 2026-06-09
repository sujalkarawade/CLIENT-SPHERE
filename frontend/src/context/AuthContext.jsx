/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const defaultUser = {
    id: 'user-default-1',
    name: 'Sujal Karawade',
    email: 'sujalkarawade18@gmail.com',
    createdAt: new Date('2026-01-15T09:00:00Z').toISOString()
  };

  const [user] = useState(defaultUser);
  const [token] = useState('bypass-auth-token');
  const [loading] = useState(false);
  const [error] = useState(null);

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