'use client';

import { usePathname } from 'next/navigation';
import {
  PLOWED_ROUTE,
  WEDDING_CARDS_ROUTE,
  WEDDING_DETAILS_ROUTE,
  WEDDING_GUIDE_ROUTE,
  WEDDING_ROUTE,
  WEDDING_RSVP_EDIT_ROUTE,
  WEDDING_RSVP_FIND_ROUTE,
  WEDDING_RSVP_ROUTE,
  WEDDING_STORY_ROUTE
} from '@/constants/routes';
import { Navigation } from '@/components/Navigation';
import { useTouchInput } from '@/hooks/useTouchInput';

// Immersive guest pages — exact matches only, so /wedding/settings keeps
// the normal site chrome.
const WEDDING_GUEST_ROUTES = new Set([
  WEDDING_ROUTE,
  WEDDING_STORY_ROUTE,
  WEDDING_DETAILS_ROUTE,
  WEDDING_RSVP_ROUTE,
  WEDDING_RSVP_FIND_ROUTE,
  WEDDING_RSVP_EDIT_ROUTE,
  WEDDING_GUIDE_ROUTE
]);

interface ConditionalNavigationProps {
  isLoggedIn: boolean;
}

export const ConditionalNavigation = ({ isLoggedIn }: ConditionalNavigationProps) => {
  const pathname = usePathname();
  const isTouch = useTouchInput();
  const isHomePage = pathname === '/';
  const isUsPage = pathname === '/us';
  const isWeddingGuestPage = WEDDING_GUEST_ROUTES.has(pathname);
  // Printable table cards — no chrome on the page or the printout
  const isWeddingCards = pathname === WEDDING_CARDS_ROUTE;
  // The game owns the whole screen on touch devices (room for the d-pad).
  const isPlowedTouch = pathname === PLOWED_ROUTE && isTouch;

  if (isHomePage || isUsPage || isWeddingGuestPage || isWeddingCards || isPlowedTouch) {
    return null;
  }

  return <Navigation isLoggedIn={isLoggedIn} pathname={pathname} />;
};
