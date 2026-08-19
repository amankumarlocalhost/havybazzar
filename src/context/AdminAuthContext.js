'use client';

/**
 * AdminAuthContext.js
 * ---------------------------------------------------------------------------
 * User wale AuthContext se JAAN-BOOJH KAR alag hai — admin token
 * localStorage me hai (silent refresh nahi hoti, koi refresh endpoint
 * bhi nahi hai backend me), isliye yahan sirf "agar token pada hai to
 * use verify karo" wala simple flow hai.
 * ---------------------------------------------------------------------------
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getAdminToken, setAdminToken, clearAdminToken } from '@/lib/tokenStore';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkExistingSession() {
      const token = getAdminToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.get('/admin/me', 'admin');
        setAdmin(me);
      } catch {
        clearAdminToken(); // token expire ho chuka ya invalid hai
      } finally {
        setLoading(false);
      }
    }
    checkExistingSession();
  }, []);

  async function login(email, password) {
    const result = await api.post('/admin/login', { email, password });
    setAdminToken(result.accessToken);
    setAdmin(result.admin);
    return result.admin;
  }

  function logout() {
    clearAdminToken();
    setAdmin(null);
  }

  // Sub-admin ke paas ye permission hai ya nahi — UI me buttons/links
  // dikhane-chhupane ke liye. Super Admin ko hamesha true milta hai
  // (backend ke `admin.model.js` ka hasPermission() yahi karta hai).
  function hasPermission(permission) {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions?.includes(permission);
  }

  const value = { admin, loading, login, logout, hasPermission };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
