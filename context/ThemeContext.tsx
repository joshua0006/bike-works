import { createContext, useContext, useState } from 'react';
import type { BusinessSettings } from '../types';

export const defaultColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

type ThemeContextType = {
  primary: string;
  colors: typeof defaultColors;
  setPrimary: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  primary: '#2563eb',
  colors: defaultColors,
  setPrimary: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<BusinessSettings['theme']>({
    primary: '#2563eb',
  });

  const setPrimary = (color: string) => {
    setTheme(prev => ({ ...prev, primary: color }));
  };

  return (
    <ThemeContext.Provider
      value={{
        ...theme,
        colors: defaultColors,
        setPrimary,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}