import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { TOKEN_COOKIE } from 'constants/authentication';
import { LOGIN_ROUTE, MANGA_ROUTE } from 'constants/routes';
import { getCookie } from 'utils/server';

export async function proxy(request: NextRequest) {
  const authCookie = await getCookie(TOKEN_COOKIE);
  const requestHeaders = await headers();
  const hostname = requestHeaders.get('host');
  const { pathname } = request.nextUrl;

  if (pathname.includes(MANGA_ROUTE) && !authCookie && hostname) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
    const baseUrl = `${protocol}${hostname}`;

    return NextResponse.redirect(new URL(LOGIN_ROUTE, baseUrl));
  }
}

export const config = {
  matcher: '/((?!api|_next|favicon.ico|login|tailboard-blue.svg).*)'
};
