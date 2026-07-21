import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { WEDDING_UNLOCK_COOKIE } from '@/constants/authentication';
import { getPublicWeddingConfig, verifyWeddingPasscode } from '@/api/wedding';
import { PasscodeGate } from '@/components/wedding/story/PasscodeGate';
import { StorybookCover } from '@/components/wedding/story/StorybookCover';

export const metadata: Metadata = {
  title: 'Our Wedding',
  robots: { index: false, follow: false }
};

// The guest storybook. Public — the shared passcode is the gate, not a login.
// The cookie holds the code itself and is re-verified against brainerd-api on
// every render, so rotating the passcode in the CMS re-locks old cookies.
export default async function WeddingPage() {
  const cookieJar = await cookies();
  const code = cookieJar.get(WEDDING_UNLOCK_COOKIE)?.value;

  const unlocked = code ? await verifyWeddingPasscode(code) : false;
  if (!unlocked) {
    return <PasscodeGate />;
  }

  const config = await getPublicWeddingConfig();
  if (!config) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#ede6e1] p-6">
        <p className="text-neutral-700">The storybook is unavailable right now — try again in a moment.</p>
      </main>
    );
  }

  return <StorybookCover config={config} />;
}
