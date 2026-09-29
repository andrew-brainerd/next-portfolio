import type { Metadata } from 'next';

import { RsvpEditLinkOpener } from '@/components/wedding/rsvp/RsvpEditLinkOpener';

export const metadata: Metadata = {
  title: 'Your RSVP',
  robots: { index: false, follow: false }
};

interface WeddingRsvpEditPageProps {
  searchParams: Promise<{ token?: string }>;
}

// Public on purpose: the emailed token is the proof, and opening it unlocks this device.
export default async function WeddingRsvpEditPage({ searchParams }: WeddingRsvpEditPageProps) {
  const { token } = await searchParams;

  return (
    <main className="storybook storybook-backdrop flex min-h-dvh items-start justify-center px-4 pt-20 pb-12">
      <div className="wedding-hub-rise w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl">
        {token ? (
          <RsvpEditLinkOpener token={token} />
        ) : (
          <p className="bg-[var(--sb-cream)] p-8 text-center font-garamond text-[var(--sb-ink)]">
            This RSVP link is incomplete. Open it straight from the email.
          </p>
        )}
      </div>
    </main>
  );
}
