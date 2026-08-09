import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
}

interface ThemeConfig {
  mode: 'light' | 'dark';
  fontSize: 'small' | 'normal' | 'large';
  colors: ThemeColors;
}

const defaultLightTheme: ThemeColors = {
  primary: '#1e40af',
  secondary: '#10b981',
  background: '#ffffff',
  text: '#0f172a',
  border: '#e2e8f0'
};

const defaultDarkTheme: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#34d399',
  background: '#1e293b',
  text: '#f1f5f9',
  border: '#475569'
};

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  toggleMode: () => void;
  setFontSize: (size: 'small' | 'normal' | 'large') => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('theme_config');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      mode: 'light',
      fontSize: 'normal',
      colors: defaultLightTheme
    };
  });

  useEffect(() => {
    localStorage.setItem('theme_config', JSON.stringify(theme));

    // Aplicar variáveis CSS
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-border', theme.colors.border);

    // Aplicar tamanho de fonte
    const fontSizeMap = {
      small: '13px',
      normal: '16px',
      large: '18px'
    };
    root.style.fontSize = fontSizeMap[theme.fontSize];

    // Aplicar classe para dark mode
    if (theme.mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleMode = () => {
    setThemeState(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
      colors: prev.mode === 'light' ? defaultDarkTheme : defaultLightTheme
    }));
  };

  const setFontSize = (size: 'small' | 'normal' | 'large') => {
    setThemeState(prev => ({
      ...prev,
      fontSize: size
    }));
  };

  const updateColors = (colors: Partial<ThemeColors>) => {
    setThemeState(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...colors
      }
    }));
  };

  const resetTheme = () => {
    const defaultTheme = {
      mode: 'light' as const,
      fontSize: 'normal' as const,
      colors: defaultLightTheme
    };
    setThemeState(defaultTheme);
    localStorage.removeItem('theme_config');
  };

  const setTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleMode, setFontSize, updateColors, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
