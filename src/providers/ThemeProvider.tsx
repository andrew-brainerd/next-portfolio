'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme, themes } from 'hooks/useTheme';

// Routes where theme should not be applied (use default styling)
const EXCLUDED_ROUTES = ['/', '/us'];

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, initializeTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Handle theme application when pathname changes
  useEffect(() => {
    const isExcluded = EXCLUDED_ROUTES.includes(pathname);

    if (isExcluded) {
      // Remove theme on excluded routes
      document.documentElement.removeAttribute('data-theme');
    } else if (themes.some(t => t.name === theme)) {
      // Apply theme on non-excluded routes
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [pathname, theme]);

  return <>{children}</>;
}
