import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [storedTheme, setStoredTheme] = useKV<Theme>('theme-preference', 'system');
  const [theme, setThemeState] = useState<Theme>(storedTheme || 'system');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  useEffect(() => {
    // Sync with stored theme on mount
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, [storedTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (selectedTheme: Theme) => {
      root.removeAttribute('data-theme');
      
      if (selectedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'dark') {
          root.setAttribute('data-theme', 'dark');
        }
      } else if (selectedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      }
    };

    applyTheme(theme);

    // Listen for system theme changes when using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(theme);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return {
    theme,
    setTheme,
  };
}