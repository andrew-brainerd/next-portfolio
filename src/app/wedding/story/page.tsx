import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { WEDDING_ROUTE } from '@/constants/routes';
import { WeddingHomeLink } from '@/components/wedding/hub/WeddingHomeLink';
import { StorybookReader } from '@/components/wedding/story/StorybookReader';
import { buildStorybook } from '@/components/wedding/story/buildStorybook';
import { WeddingClockProvider } from '@/components/wedding/WeddingClock';
import { WeddingDevClock } from '@/components/wedding/WeddingDevClock';
import { loadWeddingAccess } from '../loadWeddingAccess';

export const metadata: Metadata = {
  title: 'Our Story',
  robots: { index: false, follow: false }
};

// The illustrated storybook. Locked or not open yet → back to the hub.
export default async function WeddingStoryPage() {
  const access = await loadWeddingAccess();
  if (!access.unlocked || !access.config || !access.features?.story) {
    redirect(WEDDING_ROUTE);
  }

  const { config, clockOffset, requestTime, isAdmin } = access;
  return (
    <WeddingClockProvider offsetMs={clockOffset}>
      <StorybookReader pages={buildStorybook(config)} />
      <WeddingHomeLink />
      {isAdmin && <WeddingDevClock timeZone={config.guide.timeZone} initialNow={requestTime} weddingDate={config.weddingDate} />}
    </WeddingClockProvider>
  );
}
