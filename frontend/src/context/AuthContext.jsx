// src/context/AuthContext.jsx
// ─── Far Away — Auth Context (wired to the live backend API) ───
// Exposes the same interface the app already uses ({ isLoggedIn, authUser, login,
// register, logout }) but backed by real /api/auth endpoints + JWT storage.

import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest, googleAuthRequest, logoutRequest, fetchMe } from '../services';
import { getAccessToken, clearTokens } from '../lib/apiClient';

const AuthContext = createContext(null);

// Normalize the backend user into the shape the UI expects (needs `name`).
function toAuthUser(u) {
  if (!u) return null;
  const name =
    u.fullName ||
    [u.firstName, u.lastName].filter(Boolean).join(' ').trim() ||
    (u.email ? u.email.split('@')[0] : 'User');
  return { ...u, name, role: u.role || 'student' };
}

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  // Starts true only if a token is already stored (so we can restore the session).
  const [initializing, setInitializing] = useState(() => !!getAccessToken());

  // Restore the session on first load when a token exists.
  useEffect(() => {
    if (!getAccessToken()) return undefined;
    let active = true;
    fetchMe()
      .then((u) => {
        if (!active) return;
        setAuthUser(toAuthUser(u));
        setIsLoggedIn(true);
      })
      .catch(() => clearTokens())
      .finally(() => {
        if (active) setInitializing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    try {
      const user = await loginRequest({ email, password });
      setAuthUser(toAuthUser(user));
      setIsLoggedIn(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Unable to sign in. Please try again.' };
    }
  };

  const register = async ({ firstName, lastName, email, password, role = 'student' }) => {
    try {
      const user = await registerRequest({ firstName, lastName, email, password, role });
      setAuthUser(toAuthUser(user));
      setIsLoggedIn(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Unable to create account. Please try again.' };
    }
  };

  const googleAuth = async ({ credential, role = 'student' }) => {
    try {
      const user = await googleAuthRequest({ credential, role });
      setAuthUser(toAuthUser(user));
      setIsLoggedIn(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Unable to continue with Google. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setAuthUser(null);
      setIsLoggedIn(false);
    }
  };

  const refreshUser = async () => {
    try {
      const u = await fetchMe();
      setAuthUser(toAuthUser(u));
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const ctxValue = { isLoggedIn, authUser, initializing, login, register, googleAuth, logout, refreshUser };

  return (
    <AuthContext.Provider value={ctxValue}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context file intentionally exports the useAuth hook alongside the provider
export function useAuth() {
  return useContext(AuthContext);
}
