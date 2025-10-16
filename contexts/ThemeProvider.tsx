import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'konttazen-theme',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      // Valida o valor do tema salvo. Se não for 'light' ou 'dark', usa o padrão.
      if (item === 'light' || item === 'dark') {
        return item as Theme;
      }
      return defaultTheme;
    } catch (error) {
      // Se o localStorage não estiver disponível, retorna o tema padrão.
      console.warn(`Error reading localStorage key “${storageKey}”:`, error);
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Lógica explícita para adicionar ou remover a classe 'dark'.
    // Isso garante que o estado esteja sempre correto.
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        window.localStorage.setItem(storageKey, newTheme);
        setTheme(newTheme);
      } catch (error) {
        console.warn(`Error setting localStorage key “${storageKey}”:`, error);
      }
    },
  };

  return (  
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};