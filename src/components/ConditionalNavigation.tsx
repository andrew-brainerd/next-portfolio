'use client';

import { usePathname } from 'next/navigation';
import {
  WEDDING_CARDS_ROUTE,
  WEDDING_DETAILS_ROUTE,
  WEDDING_GUIDE_ROUTE,
  WEDDING_ROUTE,
  WEDDING_RSVP_ROUTE,
  WEDDING_STORY_ROUTE
} from '@/constants/routes';
import { Navigation } from '@/components/Navigation';

// Immersive guest pages — exact matches only, so /wedding/settings keeps
// the normal site chrome.
const WEDDING_GUEST_ROUTES = new Set([
  WEDDING_ROUTE,
  WEDDING_STORY_ROUTE,
  WEDDING_DETAILS_ROUTE,
  WEDDING_RSVP_ROUTE,
  WEDDING_GUIDE_ROUTE
]);

interface ConditionalNavigationProps {
  isLoggedIn: boolean;
}

export const ConditionalNavigation = ({ isLoggedIn }: ConditionalNavigationProps) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isUsPage = pathname === '/us';
  const isWeddingGuestPage = WEDDING_GUEST_ROUTES.has(pathname);
  // Printable table cards — no chrome on the page or the printout
  const isWeddingCards = pathname === WEDDING_CARDS_ROUTE;

  if (isHomePage || isUsPage || isWeddingGuestPage || isWeddingCards) {
    return null;
  }

  return <Navigation isLoggedIn={isLoggedIn} pathname={pathname} />;
};
