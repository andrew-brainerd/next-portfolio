import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { WEDDING_ROUTE } from '@/constants/routes';
import { RSVP_CLOSES_MONTHS_BEFORE } from '@/constants/wedding';
import { WeddingHomeLink } from '@/components/wedding/hub/WeddingHomeLink';
import { RsvpPage } from '@/components/wedding/story/pages/RsvpPage';
import { WeddingClockProvider } from '@/components/wedding/WeddingClock';
import { WeddingDevClock } from '@/components/wedding/WeddingDevClock';
import { weddingWindowOpensAt } from '@/utils/wedding';
import { loadWeddingAccess } from '../loadWeddingAccess';

export const metadata: Metadata = {
  title: 'RSVP',
  robots: { index: false, follow: false }
};

// The only place to RSVP. Locked or not open yet → back to the hub.
export default async function WeddingRsvpPage() {
  const access = await loadWeddingAccess();
  if (!access.unlocked || !access.config || !access.features?.rsvp) {
    redirect(WEDDING_ROUTE);
  }

  const { config, clockOffset, requestTime, isAdmin } = access;
  const closesAt = weddingWindowOpensAt(config.weddingDate, RSVP_CLOSES_MONTHS_BEFORE, config.guide.timeZone);
  return (
    <WeddingClockProvider offsetMs={clockOffset}>
      <main className="storybook storybook-backdrop flex min-h-dvh items-start justify-center px-4 pt-20 pb-12">
        <div className="wedding-hub-rise w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl">
          <RsvpPage config={config} closesAt={closesAt} />
        </div>
      </main>
      <WeddingHomeLink />
      {isAdmin && <WeddingDevClock timeZone={config.guide.timeZone} initialNow={requestTime} weddingDate={config.weddingDate} />}
    </WeddingClockProvider>
  );
}
