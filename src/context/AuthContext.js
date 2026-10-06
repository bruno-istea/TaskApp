import React, {createContext, useContext, useEffect, useState} from 'react';
import {clearSession, getSession, saveSession} from '../storage/storage';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app, recupera la sesión guardada (si existe).
  useEffect(() => {
    getSession()
      .then(saved => setUser(saved))
      .finally(() => setLoading(false));
  }, []);

  const login = async username => {
    await saveSession(username);
    setUser(username);
  };

  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, loading, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
