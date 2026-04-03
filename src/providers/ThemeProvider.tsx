'use client';

import { useEffect } from 'react';
import { useTheme, themes, ThemeName } from 'hooks/useTheme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Sync Zustand store with whatever the server set on <html>
    const serverTheme = document.documentElement.getAttribute('data-theme') as ThemeName | null;
    if (serverTheme && themes.some(t => t.name === serverTheme)) {
      setTheme(serverTheme);
    }
  }, [setTheme]);

  return <>{children}</>;
}
