import { NextRequest, NextResponse } from 'next/server';

import { WEDDING_GUIDE_ROUTE } from '@/constants/routes';
import { verifyWeddingPasscode } from '@/api/wedding';
import { setWeddingUnlockCookie } from '@/utils/weddingUnlock';

const TABLE_ID = /^[a-z0-9-]{1,24}$/i;

// QR codes and NFC tags open this URL (?k=<guideKey>[&table=<id>]). A GET can
// set cookies where a server component can't: unlock, then 303 into the guide.
// A bad or missing key still lands on the guide, which shows the passcode gate.
export async function GET(request: NextRequest) {
  const key = (request.nextUrl.searchParams.get('k') ?? '').trim();
  const table = request.nextUrl.searchParams.get('table') ?? '';

  const destination = request.nextUrl.clone();
  destination.pathname = WEDDING_GUIDE_ROUTE;
  destination.search = TABLE_ID.test(table) ? `?table=${table}` : '';

  const response = NextResponse.redirect(destination, 303);
  if (key && (await verifyWeddingPasscode(key))) {
    setWeddingUnlockCookie(response, key);
  }

  return response;
}
