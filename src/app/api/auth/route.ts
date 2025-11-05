import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { TOKEN_COOKIE, USER_COOKIE } from '@/constants/authentication';

export async function DELETE() {
  const cookieJar = await cookies();

  // Delete authentication cookies
  cookieJar.delete(TOKEN_COOKIE);
  cookieJar.delete(USER_COOKIE);

  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
