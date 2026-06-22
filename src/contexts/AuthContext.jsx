import { createContext, useContext, useState, useCallback } from 'react';
import { api, setTokens, clearTokens } from '../utils/api';

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem('gm_cp_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.user?.role !== 'CUSTOMER') {
        throw new Error('Access denied. This portal is for customers only.');
      }
      setTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
      const userInfo = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      };
      localStorage.setItem('gm_cp_user', JSON.stringify(userInfo));
      setUser(userInfo);
      return userInfo;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('gm_cp_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
