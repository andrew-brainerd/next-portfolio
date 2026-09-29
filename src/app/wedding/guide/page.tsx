import type { Metadata } from 'next';

import { WeddingGuide } from '@/components/wedding/guide/WeddingGuide';
import { PasscodeGate } from '@/components/wedding/story/PasscodeGate';
import { WeddingClockProvider } from '@/components/wedding/WeddingClock';
import { WeddingDevClock } from '@/components/wedding/WeddingDevClock';
import { loadWeddingAccess } from '../loadWeddingAccess';

export const metadata: Metadata = {
  title: 'Wedding Guide',
  robots: { index: false, follow: false }
};

interface WeddingGuidePageProps {
  searchParams: Promise<{ table?: string }>;
}

const GuideMessage = ({ children }: { children: string }) => (
  <main className="storybook flex min-h-dvh items-center justify-center bg-[var(--sb-cream)] p-6 text-center">
    <p className="max-w-sm font-garamond text-lg text-[var(--sb-ink)]/80">{children}</p>
  </main>
);

// The day-of guidebook. Same gate as the hub: the unlock cookie (set by
// /wedding/enter from a tag key, or by typing the invite passcode) is
// re-verified on every render. Opens on the wedding day, or earlier via guide.enabled.
export default async function WeddingGuidePage({ searchParams }: WeddingGuidePageProps) {
  const access = await loadWeddingAccess();
  if (!access.unlocked) {
    return (
      <PasscodeGate
        kicker="Your guide to"
        title="Our Wedding"
        prompt="Scan the QR code on your table, or enter the passcode from your invitation."
        buttonLabel="Open the guide"
      />
    );
  }

  const { config, features, clockOffset, requestTime, isAdmin } = access;
  if (!config || !features) {
    return <GuideMessage>The guide is unavailable right now — try again in a moment.</GuideMessage>;
  }

  const devClock = isAdmin && <WeddingDevClock timeZone={config.guide.timeZone} initialNow={requestTime} />;
  if (!features.guide) {
    return (
      <WeddingClockProvider offsetMs={clockOffset}>
        <GuideMessage>The wedding guide opens closer to the big day. Check back soon!</GuideMessage>
        {devClock}
      </WeddingClockProvider>
    );
  }

  const { table } = await searchParams;
  return (
    <WeddingClockProvider offsetMs={clockOffset}>
      <WeddingGuide config={config} initialNow={requestTime} tableId={table} />
      {devClock}
    </WeddingClockProvider>
  );
}
