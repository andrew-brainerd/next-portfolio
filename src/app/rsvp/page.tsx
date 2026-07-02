import type { Metadata } from 'next';

import { RSVP_EVENT } from '@/constants/rsvp';
import { getGuestBook } from '@/api/rsvp';
import { RsvpHero } from '@/components/rsvp/RsvpHero';
import { SurpriseBanner } from '@/components/rsvp/SurpriseBanner';
import { DirectionsButton } from '@/components/rsvp/DirectionsButton';
import { AddToCalendarButton } from '@/components/rsvp/AddToCalendarButton';
import { RsvpShell } from '@/components/rsvp/RsvpShell';

// noindex — the party is a surprise; discovery is link-only (spec FR-01)
export const metadata: Metadata = {
  title: `${RSVP_EVENT.coupleNames} — ${RSVP_EVENT.title}`,
  robots: { index: false, follow: false }
};

// Always render fresh so the server-fetched guest book isn't baked in at build time
export const dynamic = 'force-dynamic';

export default async function RsvpPage() {
  const guestBook = await getGuestBook();

  return (
    <div className="container mx-auto max-w-2xl space-y-8 p-6">
      <SurpriseBanner />
      <RsvpHero />
      <div className="flex justify-center gap-3">
        <DirectionsButton />
        <AddToCalendarButton />
      </div>
      <RsvpShell initialGuestBook={guestBook} />
    </div>
  );
}
