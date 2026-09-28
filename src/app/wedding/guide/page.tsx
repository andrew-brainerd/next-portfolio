import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { WEDDING_UNLOCK_COOKIE } from '@/constants/authentication';
import { getPublicWeddingConfig, verifyWeddingPasscode } from '@/api/wedding';
import { WeddingGuide } from '@/components/wedding/guide/WeddingGuide';
import { PasscodeGate } from '@/components/wedding/story/PasscodeGate';

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

// The day-of guidebook. Same gate as the storybook: the unlock cookie (set by
// /wedding/enter from a tag key, or by typing the invite passcode) is
// re-verified on every render.
export default async function WeddingGuidePage({ searchParams }: WeddingGuidePageProps) {
  const cookieJar = await cookies();
  const code = cookieJar.get(WEDDING_UNLOCK_COOKIE)?.value;

  const unlocked = code ? await verifyWeddingPasscode(code) : false;
  if (!unlocked) {
    return (
      <PasscodeGate
        kicker="Your guide to"
        title="Our Wedding"
        prompt="Scan the QR code on your table, or enter the passcode from your invitation."
        buttonLabel="Open the guide"
      />
    );
  }

  const config = await getPublicWeddingConfig();
  if (!config) {
    return <GuideMessage>The guide is unavailable right now — try again in a moment.</GuideMessage>;
  }

  if (!config.guide.enabled) {
    return <GuideMessage>The wedding guide opens closer to the big day. Check back soon!</GuideMessage>;
  }

  const { table } = await searchParams;
  // Seeds the client clocks so now/next renders identically on server and client.
  // A server component renders once per request, so reading the clock is safe here.
  // eslint-disable-next-line react-hooks/purity
  const requestTime = Date.now();
  return <WeddingGuide config={config} initialNow={requestTime} tableId={table} />;
}
