import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { TOKEN_COOKIE } from 'constants/authentication';
import { KEIKEN_ROUTE, LOGIN_ROUTE, MANGA_ROUTE } from 'constants/routes';
import { getCookie } from 'utils/server';

export async function proxy(request: NextRequest) {
  const authCookie = await getCookie(TOKEN_COOKIE);
  const requestHeaders = await headers();
  const hostname = requestHeaders.get('host');
  const { pathname } = request.nextUrl;

  const protectedRoutes = [MANGA_ROUTE, KEIKEN_ROUTE];
  const isProtectedRoute = protectedRoutes.some(route => pathname.includes(route));

  if (isProtectedRoute && !authCookie && hostname) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
    const baseUrl = `${protocol}${hostname}`;

    return NextResponse.redirect(new URL(LOGIN_ROUTE, baseUrl));
  }
}

export const config = {
  matcher: '/((?!api|_next|favicon.ico|login|tailboard-blue.svg).*)'
};
