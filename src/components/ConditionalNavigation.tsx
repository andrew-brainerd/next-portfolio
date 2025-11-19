'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface ConditionalNavigationProps {
  isLoggedIn: boolean;
}

export default function ConditionalNavigation({ isLoggedIn }: ConditionalNavigationProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isUsPage = pathname === '/us';

  if (isHomePage || isUsPage) {
    return null;
  }

  return <Navigation isLoggedIn={isLoggedIn} pathname={pathname} />;
}
