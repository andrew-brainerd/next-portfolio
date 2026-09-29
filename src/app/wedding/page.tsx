import type { Metadata } from 'next';

import { PasscodeGate } from '@/components/wedding/story/PasscodeGate';
import { WeddingHub } from '@/components/wedding/hub/WeddingHub';
import { WeddingClockProvider } from '@/components/wedding/WeddingClock';
import { WeddingDevClock } from '@/components/wedding/WeddingDevClock';
import { loadWeddingAccess } from './loadWeddingAccess';

export const metadata: Metadata = {
  title: 'Our Wedding',
  robots: { index: false, follow: false }
};

// The guest hub. Public — the shared passcode is the gate, not a login. Tiles
// appear as each page's release window opens (spec §3 "Release windows").
export default async function WeddingPage() {
  const access = await loadWeddingAccess();
  if (!access.unlocked) {
    return <PasscodeGate />;
  }

  const { config, features, clockOffset, requestTime, isAdmin } = access;
  if (!config || !features) {
    return (
      <main className="storybook flex min-h-dvh items-center justify-center bg-[var(--sb-cream)] p-6">
        <p className="font-garamond text-[var(--sb-ink)]/70">
          The wedding pages are unavailable right now — try again in a moment.
        </p>
      </main>
    );
  }

  return (
    <WeddingClockProvider offsetMs={clockOffset}>
      <WeddingHub config={config} features={features} now={requestTime} />
      {isAdmin && <WeddingDevClock timeZone={config.guide.timeZone} initialNow={requestTime} />}
    </WeddingClockProvider>
  );
}
