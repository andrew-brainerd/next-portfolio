'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ConditionalNavigation } from '@/components/ConditionalNavigation';
import { Win95Shell } from '@/components/win95/Win95Shell';
import { useWin95Mode } from '@/hooks/useWin95Mode';

interface SiteChromeProps {
  isLoggedIn: boolean;
  children: React.ReactNode;
}

export const SiteChrome = ({ isLoggedIn, children }: SiteChromeProps) => {
  const pathname = usePathname();
  const { enabled, initialize } = useWin95Mode();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (enabled) {
    return (
      <Win95Shell isLoggedIn={isLoggedIn} pathname={pathname}>
        <div id="main-content">{children}</div>
      </Win95Shell>
    );
  }

  return (
    <>
      <ConditionalNavigation isLoggedIn={isLoggedIn} />
      <div id="main-content">{children}</div>
    </>
  );
};
