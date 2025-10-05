import { useKV } from '@github/spark/hooks';
import React, { useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useKV<Theme>('theme', 'system');

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

    if (theme) {
      applyTheme(theme);
    }

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