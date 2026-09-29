import { headers } from 'next/headers';

import { WEDDING_ENTER_ROUTE } from '@/constants/routes';
import { WEDDING_SITE_ORIGIN } from '@/constants/wedding';
import { toWeddingSitePath } from '@/utils/weddingShare';

// Server-only: reads the request headers.

/** Origin of the current request, so dev links match whichever host the owner is on. */
export const getRequestOrigin = async (): Promise<string> => {
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
};

/**
 * Full URL of a guest page as guests should receive it: on the wedding domain in production,
 * this request's origin in local dev so links can be tested there.
 */
export const getWeddingPageUrl = async (route: string): Promise<string> =>
  process.env.NODE_ENV === 'production'
    ? `${WEDDING_SITE_ORIGIN}${toWeddingSitePath(route)}`
    : `${await getRequestOrigin()}${route}`;

/** Entry URL that share links and table tags are built on. */
export const getWeddingEnterUrl = (): Promise<string> => getWeddingPageUrl(WEDDING_ENTER_ROUTE);
