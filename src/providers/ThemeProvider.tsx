'use client';

import { useEffect } from 'react';
import { useTheme } from 'hooks/useTheme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { initializeTheme } = useTheme();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
}
