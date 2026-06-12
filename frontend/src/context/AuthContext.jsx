// src/context/AuthContext.jsx
// ─── Far Away — Auth Context (client-side mock) ───

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  // Simple client-side login — accepts any non-empty credentials
  // If email contains "teacher" or "prof", assigns the teacher role.
  const login = ({ email, password }) => {
    if (!email || !password) return { ok: false, error: 'Please fill in all fields.' };
    const isTeacher = email.toLowerCase().includes('teacher') || email.toLowerCase().includes('prof');
    const name = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    setAuthUser({ email, name: formatted, role: isTeacher ? 'teacher' : 'student' });
    setIsLoggedIn(true);
    return { ok: true };
  };

  // Register — accepts explicit role switcher value
  const register = ({ name, email, password, role = 'student' }) => {
    if (!name || !email || !password) return { ok: false, error: 'Please fill in all fields.' };
    setAuthUser({ email, name, role });
    setIsLoggedIn(true);
    return { ok: true };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, authUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
