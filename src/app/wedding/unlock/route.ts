import { NextRequest, NextResponse } from 'next/server';

import { WEDDING_UNLOCK_COOKIE } from '@/constants/authentication';
import { WEDDING_ROUTE } from '@/constants/routes';
import { verifyWeddingPasscode } from '@/api/wedding';

// ~60 days — long enough to span save-the-date → RSVP visits without re-entry
const UNLOCK_MAX_AGE_SECONDS = 60 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  let code = '';
  try {
    const body = (await request.json()) as { code?: string };
    code = (body.code ?? '').trim();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ message: 'Passcode required' }, { status: 400 });
  }

  const unlocked = await verifyWeddingPasscode(code);
  if (!unlocked) {
    return NextResponse.json({ message: 'Incorrect passcode' }, { status: 401 });
  }

  // The cookie holds the code itself; the /wedding page re-verifies it against
  // the backend on every render, so a passcode rotation re-locks old cookies.
  const response = NextResponse.json({ unlocked: true });
  response.cookies.set(WEDDING_UNLOCK_COOKIE, code, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: UNLOCK_MAX_AGE_SECONDS,
    path: WEDDING_ROUTE
  });

  return response;
}
