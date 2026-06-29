import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';

export async function DELETE() {
  const cookieJar = await cookies();
  // Session cookies are set with an explicit Domain (e.g. .brainerd.dev), so they must be
  // cleared with the same Domain/Path or the browser keeps them and the user stays "logged in".
  const domain = process.env.COOKIE_DOMAIN;

  for (const name of [TOKEN_COOKIE, USER_COOKIE]) {
    // Match the Domain the cookie was set with; a host-only delete here would
    // overwrite this domain-scoped clear and leave the cookie in place.
    cookieJar.set(name, '', { path: '/', domain, maxAge: 0 });
  }

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
