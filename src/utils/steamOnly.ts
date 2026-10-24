import { APPS_ROUTE, CONDENSATE_ROUTE, LINK_ROUTE, LOGIN_ROUTE, SETTINGS_ROUTE } from '@/constants/routes';

// Signed in with Steam and not linked to an email or Google account (condensate spec FR-48): Condensate only.
export const isSteamOnlyUid = (uid: string | null | undefined): boolean => !!uid?.startsWith('steam:');

const STEAM_ONLY_ROUTES = [CONDENSATE_ROUTE, APPS_ROUTE, LINK_ROUTE, LOGIN_ROUTE, SETTINGS_ROUTE];

export const steamOnlyAllows = (pathname: string): boolean =>
  STEAM_ONLY_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

// The brainerd-id cookie may arrive URL-encoded (steam%3A…).
export const cookieUid = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
