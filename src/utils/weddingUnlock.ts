import type { NextResponse } from 'next/server';

import { WEDDING_MOCK_OFFSET_COOKIE, WEDDING_UNLOCK_COOKIE } from '@/constants/authentication';
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

// ~30 days, matching the admin mock clock panel
const MOCK_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

// Share-link preview date as a mock-clock offset. Not httpOnly: the admin panel resets it from the page.
export const setWeddingMockCookie = (response: NextResponse, offsetMs: number): void => {
  response.cookies.set(WEDDING_MOCK_OFFSET_COOKIE, String(offsetMs), {
    secure: true,
    sameSite: 'lax',
    maxAge: MOCK_MAX_AGE_SECONDS,
    path: WEDDING_ROUTE
  });
};

export const clearWeddingMockCookie = (response: NextResponse): void => {
  response.cookies.set(WEDDING_MOCK_OFFSET_COOKIE, '', { maxAge: 0, path: WEDDING_ROUTE });
};
