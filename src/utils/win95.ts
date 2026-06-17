import dayjs from 'dayjs';
import { Win95App } from '@/types/win95';

/**
 * Resolve the curated app that "owns" the current path. Exact matches win; otherwise the
 * deepest non-root route that prefixes the path is used (so `/steam/foo` maps to Steam).
 */
export const win95AppForPath = (pathname: string, apps: Win95App[]): Win95App | undefined => {
  const exact = apps.find(app => app.route === pathname);
  if (exact) return exact;

  return apps
    .filter(app => app.route !== '/' && pathname.startsWith(`${app.route}/`))
    .sort((a, b) => b.route.length - a.route.length)[0];
};

/** Classic taskbar clock, e.g. "12:00 PM". */
export const formatWin95Clock = (date: Date): string => dayjs(date).format('h:mm A');
