'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface ConditionalNavigationProps {
  isLoggedIn: boolean;
}

export default function ConditionalNavigation({ isLoggedIn }: ConditionalNavigationProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return null;
  }

  return <Navigation isLoggedIn={isLoggedIn} pathname={pathname} />;
}
