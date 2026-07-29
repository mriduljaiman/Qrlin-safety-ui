import React, { createContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types/user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  clearMustChangePassword: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  initializing: true,
  login: () => {},
  logout: () => {},
  clearMustChangePassword: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setInitializing(false);
  }, []);

  const login = (authData: AuthResponse) => {
    const userData: User = {
      id: authData.userId,
      email: authData.email,
      fullName: '',
      role: authData.role,
      mustChangePassword: authData.mustChangePassword,
    };

    setToken(authData.token);
    setUser(userData);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Called once the forced password change completes - avoids a full re-login just to flip
  // one flag, since the backend already cleared mustChangePassword on its side.
  const clearMustChangePassword = () => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, mustChangePassword: false };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      initializing,
      login,
      logout,
      clearMustChangePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};