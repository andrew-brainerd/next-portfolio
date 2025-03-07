import { redirect, RedirectType } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { LOGIN_ROUTE, RESET_PASSWORD_ROUTE } from 'constants/routes';

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get('mode');
  const oobCode = params.get('oobCode');

  if (mode === 'resetPassword') {
    redirect(`${RESET_PASSWORD_ROUTE}?code=${oobCode}`, RedirectType.replace);
  } else {
    redirect(LOGIN_ROUTE, RedirectType.replace);
  }
}
