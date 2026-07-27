import React, { createContext, useEffect, useState } from 'react';
import { profileAPI } from '../api/profile';
import { useAuth } from '../hooks/useAuth';

export const THEMES = [
  { id: 'default', label: 'Default', primary: '#667eea', secondary: '#764ba2' },
  { id: 'ocean', label: 'Ocean', primary: '#0ea5e9', secondary: '#0891b2' },
  { id: 'sunset', label: 'Sunset', primary: '#f97316', secondary: '#db2777' },
  { id: 'forest', label: 'Forest', primary: '#16a34a', secondary: '#15803d' },
  { id: 'rose', label: 'Rose', primary: '#f43f5e', secondary: '#e11d48' },
  { id: 'midnight', label: 'Midnight', primary: '#818cf8', secondary: '#6366f1' },
  { id: 'candy', label: 'Candy', primary: '#a855f7', secondary: '#ec4899' },
];

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string, persist?: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => localStorage.getItem('theme') || 'default');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated) return;
    profileAPI.getPreferences()
      .then((prefs) => {
        if (prefs.theme) {
          setThemeState(prefs.theme);
          localStorage.setItem('theme', prefs.theme);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const setTheme = (newTheme: string, persist = true) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (persist && isAuthenticated) {
      profileAPI.updatePreferences({ theme: newTheme }).catch(() => {});
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
