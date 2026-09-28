'use client';

import { usePathname } from 'next/navigation';
import { WEDDING_CARDS_ROUTE, WEDDING_ROUTE } from '@/constants/routes';
import { Navigation } from '@/components/Navigation';

interface ConditionalNavigationProps {
  isLoggedIn: boolean;
}

export const ConditionalNavigation = ({ isLoggedIn }: ConditionalNavigationProps) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isUsPage = pathname === '/us';
  // The wedding storybook is an immersive guest page — exact match only, so
  // /wedding/settings and /wedding/planning keep the normal site chrome.
  const isWeddingStorybook = pathname === WEDDING_ROUTE;
  // Printable table cards — no chrome on the page or the printout
  const isWeddingCards = pathname === WEDDING_CARDS_ROUTE;

  if (isHomePage || isUsPage || isWeddingStorybook || isWeddingCards) {
    return null;
  }

  return <Navigation isLoggedIn={isLoggedIn} pathname={pathname} />;
};
