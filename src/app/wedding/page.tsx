import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { WEDDING_UNLOCK_COOKIE } from '@/constants/authentication';
import { getPublicWeddingConfig, verifyWeddingPasscode } from '@/api/wedding';
import { PasscodeGate } from '@/components/wedding/story/PasscodeGate';
import { StorybookReader } from '@/components/wedding/story/StorybookReader';
import { buildStorybook } from '@/components/wedding/story/buildStorybook';

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
      <main className="storybook flex min-h-dvh items-center justify-center bg-[var(--sb-cream)] p-6">
        <p className="font-garamond text-[var(--sb-ink)]/70">
          The storybook is unavailable right now — try again in a moment.
        </p>
      </main>
    );
  }

  return <StorybookReader pages={buildStorybook(config)} />;
}
