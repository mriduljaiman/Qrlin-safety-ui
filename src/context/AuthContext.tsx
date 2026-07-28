import React, { createContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types/user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  initializing: true,
  login: () => {},
  logout: () => {},
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

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      initializing,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};