import { NextResponse, type NextRequest } from 'next/server';

import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';
import { CONDENSATE_ROUTE } from '@/constants/routes';
import { cookieUid, isSteamOnlyUid, steamOnlyAllows } from '@/utils/steamOnly';

// Steam-only accounts see just Condensate (condensate spec FR-48); brainerd-api enforces the same rule.
export function proxy(request: NextRequest) {
  const signedIn = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  const uid = cookieUid(request.cookies.get(USER_COOKIE)?.value);
  if (!signedIn || !isSteamOnlyUid(uid) || steamOnlyAllows(request.nextUrl.pathname)) return NextResponse.next();
  return NextResponse.redirect(new URL(CONDENSATE_ROUTE, request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|icons|apple-icon|.*\\..*).*)']
};
