import { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('emp_user');
    const parsed = stored ? JSON.parse(stored) : null;
    // Sesión vencida: se descarta en lugar de mostrar la app hasta el primer 401.
    if (parsed && new Date(parsed.expiresAtUtc) <= new Date()) {
      localStorage.removeItem('emp_token');
      localStorage.removeItem('emp_user');
      return null;
    }
    return parsed;
  });

  const login = useCallback(async (username, password) => {
    const { data } = await client.post('/auth/login', { username, password });
    const sessionUser = { username: data.username, role: data.role, expiresAtUtc: data.expiresAtUtc };
    localStorage.setItem('emp_token', data.token);
    localStorage.setItem('emp_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('emp_token');
    localStorage.removeItem('emp_user');
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
