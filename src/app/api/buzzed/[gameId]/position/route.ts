import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { TOKEN_COOKIE } from '@/constants/authentication';

interface PositionRouteParams {
  params: Promise<{ gameId: string }>;
}

// A `navigator.sendBeacon` target. The regular `'use server'` API actions cannot be used for the
// leaving-the-page save — an action fired during unload is cancelled along with the page, which is
// exactly when we most need the position written. A beacon is same-origin, carries the session cookie,
// and the browser guarantees it is flushed.
export async function POST(request: Request, { params }: PositionRouteParams) {
  const { gameId } = await params;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;

  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { positionSec } = await request.json();

  if (typeof positionSec !== 'number' || !Number.isFinite(positionSec)) {
    return NextResponse.json({ message: 'positionSec is required' }, { status: 400 });
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/buzzed/games/${gameId}/position`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ positionSec: Math.max(0, positionSec) })
    }
  );

  return NextResponse.json({ saved: response.ok }, { status: response.ok ? 200 : 502 });
}
