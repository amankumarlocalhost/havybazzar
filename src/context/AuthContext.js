'use client';

/**
 * AuthContext.js
 * ---------------------------------------------------------------------------
 * Buyer/Seller ka auth state — poore app me `useAuth()` se access hota hai.
 *
 * App load hote hi ek "silent refresh" try hoti hai: agar user pehle se
 * login tha (httpOnly refresh cookie abhi bhi valid hai), to bina login
 * form dikhaye seedha wapas logged-in ho jaata hai. Ye backend ke
 * `POST /auth/refresh-token` endpoint se hota hai (Phase 2 me bana tha).
 * ---------------------------------------------------------------------------
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { setUserToken, clearUserToken } from '@/lib/tokenStore';
import { refreshUserToken } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true jab tak silent-refresh check na ho jaaye

  const fetchMe = useCallback(async () => {
    try {
      const me = await api.get('/auth/me', 'user');
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function silentRefresh() {
      try {
        await refreshUserToken();
      } catch {
        // koi valid session nahi thi — normal hai, pehli baar aane wale ke liye.
        // Backend /auth/me abhi bhi kaam karega (guest fallback authenticate.js me).
      }
      await fetchMe();
      setLoading(false);
    }
    silentRefresh();
  }, [fetchMe]);

  async function login(identifier, password) {
    const result = await api.post('/auth/login', { identifier, password });
    setUserToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }

  async function signup(email, phone, password, fullName) {
    return api.post('/auth/signup', { email, phone, password, fullName });
  }

  async function verifySignupOtp(identifier, otp) {
    const result = await api.post('/auth/verify-signup-otp', { identifier, otp, purpose: 'signup' });
    setUserToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {}, 'user');
    } catch {
      // logout API fail bhi ho jaaye, phir bhi local state clear karo
    }
    clearUserToken();
    setUser(null);
  }

  async function switchRole(role) {
    const result = await api.post('/auth/switch-role', { role }, 'user');
    setUser((prev) => ({ ...prev, activeRole: result.activeRole, roles: result.roles }));
    return result;
  }

  async function updateProfile(data) {
    const result = await api.patch('/auth/profile', data, 'user');
    setUser(result);
    return result;
  }

  const value = {
    user,
    loading,
    login,
    signup,
    verifySignupOtp,
    logout,
    switchRole,
    updateProfile,
    refreshUser: fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
