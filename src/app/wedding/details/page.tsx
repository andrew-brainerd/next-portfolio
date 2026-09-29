import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { WEDDING_ROUTE } from '@/constants/routes';
import { WeddingDetails } from '@/components/wedding/details/WeddingDetails';
import { WeddingHomeLink } from '@/components/wedding/hub/WeddingHomeLink';
import { WeddingClockProvider } from '@/components/wedding/WeddingClock';
import { WeddingDevClock } from '@/components/wedding/WeddingDevClock';
import { loadWeddingAccess } from '../loadWeddingAccess';

export const metadata: Metadata = {
  title: 'Venue & Hotels',
  robots: { index: false, follow: false }
};

// Venue, schedule, hotels, travel, registry and FAQ. Locked or not open yet → back to the hub.
export default async function WeddingDetailsPage() {
  const access = await loadWeddingAccess();
  if (!access.unlocked || !access.config || !access.features?.details) {
    redirect(WEDDING_ROUTE);
  }

  const { config, clockOffset, requestTime, isAdmin } = access;
  return (
    <WeddingClockProvider offsetMs={clockOffset}>
      <WeddingDetails config={config} />
      <WeddingHomeLink />
      {isAdmin && <WeddingDevClock timeZone={config.guide.timeZone} initialNow={requestTime} />}
    </WeddingClockProvider>
  );
}
