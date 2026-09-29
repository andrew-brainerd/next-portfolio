import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { WEDDING_ROUTE } from '@/constants/routes';
import { WeddingHomeLink } from '@/components/wedding/hub/WeddingHomeLink';
import { RsvpFinder } from '@/components/wedding/rsvp/RsvpFinder';
import { WeddingClockProvider } from '@/components/wedding/WeddingClock';
import { WeddingDevClock } from '@/components/wedding/WeddingDevClock';
import { loadWeddingAccess } from '../../loadWeddingAccess';

export const metadata: Metadata = {
  title: 'Find your RSVP',
  robots: { index: false, follow: false }
};

// Same gate and window as /wedding/rsvp; the API closes lookups with the RSVP cutoff.
export default async function WeddingRsvpFindPage() {
  const access = await loadWeddingAccess();
  if (!access.unlocked || !access.config || !access.features?.rsvp) {
    redirect(WEDDING_ROUTE);
  }

  const { config, clockOffset, requestTime, isAdmin } = access;
  return (
    <WeddingClockProvider offsetMs={clockOffset}>
      <main className="storybook storybook-backdrop flex min-h-dvh items-start justify-center px-4 pt-20 pb-12">
        <div className="wedding-hub-rise w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl">
          <RsvpFinder />
        </div>
      </main>
      <WeddingHomeLink />
      {isAdmin && <WeddingDevClock timeZone={config.guide.timeZone} initialNow={requestTime} weddingDate={config.weddingDate} />}
    </WeddingClockProvider>
  );
}
