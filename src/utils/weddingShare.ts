import {
  WEDDING_DETAILS_ROUTE,
  WEDDING_GUIDE_ROUTE,
  WEDDING_ROUTE,
  WEDDING_RSVP_ROUTE,
  WEDDING_STORY_ROUTE
} from '@/constants/routes';
import { SHARE_DESTINATIONS } from '@/constants/wedding';
import type { ShareDestination } from '@/types/wedding';

const DESTINATION_ROUTES: Record<ShareDestination, string> = {
  hub: WEDDING_ROUTE,
  story: WEDDING_STORY_ROUTE,
  details: WEDDING_DETAILS_ROUTE,
  rsvp: WEDDING_RSVP_ROUTE,
  guide: WEDDING_GUIDE_ROUTE
};

const TABLE_ID = /^[a-z0-9-]{1,24}$/i;

/**
 * Where /wedding/enter sends a visitor. Share links carry `to` (unknown values fall back to the hub);
 * printed table tags have none and keep landing on the guide with their table.
 */
export const resolveEnterDestination = (
  to: string | null,
  table: string | null
): { pathname: string; search: string } => {
  if (to !== null) {
    const pathname = Object.hasOwn(DESTINATION_ROUTES, to) ? DESTINATION_ROUTES[to as ShareDestination] : WEDDING_ROUTE;
    return { pathname, search: '' };
  }
  return { pathname: WEDDING_GUIDE_ROUTE, search: table && TABLE_ID.test(table) ? `?table=${table}` : '' };
};

/** Share-link URLs on `enterUrl` for every destination; empty until a share key is saved. */
export const shareLinkUrls = (
  enterUrl: string,
  shareKey: string
): { to: ShareDestination; label: string; url: string }[] => {
  if (!shareKey) return [];
  const base = `${enterUrl}?k=${encodeURIComponent(shareKey)}`;
  return SHARE_DESTINATIONS.map(({ value, label }) => ({ to: value, label, url: `${base}&to=${value}` }));
};

/** A /wedding route on the wedding domain, which redirects back under /wedding: /wedding/enter → /enter. */
export const toWeddingSitePath = (route: string): string => {
  if (route === WEDDING_ROUTE) return '/';
  return route.startsWith(`${WEDDING_ROUTE}/`) ? route.slice(WEDDING_ROUTE.length) : route;
};
