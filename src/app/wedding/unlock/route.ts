import { NextRequest, NextResponse } from 'next/server';

import { verifyWeddingPasscode } from '@/api/wedding';
import { setWeddingUnlockCookie } from '@/utils/weddingUnlock';

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

  const response = NextResponse.json({ unlocked: true });
  setWeddingUnlockCookie(response, code);
  return response;
}
