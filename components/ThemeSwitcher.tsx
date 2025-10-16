import React from 'react';
import { useTheme } from '../contexts/ThemeProvider';
import { Sun, Moon } from './icons';
import { Button } from './ui/button';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'Claro', value: 'light', icon: Sun },
    { name: 'Escuro', value: 'dark', icon: Moon },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1">
      {themes.map(({ name, value, icon: Icon }) => (
        <Button
          key={value}
          onClick={() => setTheme(value as 'light' | 'dark')}
          className={`
            flex-1 justify-center gap-2 transition-colors
            ${theme === value
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-50'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-900/20'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          {name}
        </Button>
      ))}
    </div>
  );
}