import { NextRequest, NextResponse } from 'next/server';

import { verifyWeddingPasscode } from '@/api/wedding';
import { clearWeddingMockCookie, setWeddingMockCookie, setWeddingUnlockCookie } from '@/utils/weddingUnlock';
import { parsePreviewAt, resolveEnterDestination } from '@/utils/weddingShare';

// QR codes, NFC tags and share links open this URL (?k=<key>[&table=<id>] or
// ?k=<shareKey>&to=<page>[&at=<epoch ms>]). A GET can set cookies where a server
// component can't: unlock, then 303 on. A future `at` starts the visitor's mock
// clock there; entering without one returns them to real time. A bad or missing
// key still lands on the destination, which shows the passcode gate (or
// redirects to the hub, which does).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const key = (searchParams.get('k') ?? '').trim();
  const { pathname, search } = resolveEnterDestination(searchParams.get('to'), searchParams.get('table'));

  const destination = request.nextUrl.clone();
  destination.pathname = pathname;
  destination.search = search;

  const response = NextResponse.redirect(destination, 303);
  if (key && (await verifyWeddingPasscode(key))) {
    setWeddingUnlockCookie(response, key);

    const previewAt = parsePreviewAt(searchParams.get('at'));
    const offset = previewAt ? previewAt - Date.now() : 0;
    if (offset > 0) setWeddingMockCookie(response, offset);
    else clearWeddingMockCookie(response);
  }

  return response;
}
