import type { NextResponse } from 'next/server';

import { WEDDING_UNLOCK_COOKIE } from '@/constants/authentication';
import { WEDDING_ROUTE } from '@/constants/routes';

// ~60 days — long enough to span save-the-date → RSVP visits without re-entry
const UNLOCK_MAX_AGE_SECONDS = 60 * 24 * 60 * 60;

// The cookie holds the code itself; /wedding pages re-verify it against the
// backend on every render, so rotating a code re-locks old cookies.
export const setWeddingUnlockCookie = (response: NextResponse, code: string): void => {
  response.cookies.set(WEDDING_UNLOCK_COOKIE, code, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: UNLOCK_MAX_AGE_SECONDS,
    path: WEDDING_ROUTE
  });
};
