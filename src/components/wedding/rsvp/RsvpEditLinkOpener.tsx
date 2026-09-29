'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { WEDDING_RSVP_FIND_ROUTE, WEDDING_RSVP_ROUTE } from '@/constants/routes';
import { openWeddingRsvpEditLink } from '@/api/wedding';
import { saveRsvpToThisDevice } from '@/utils/weddingClient';
import { LogisticsPage } from '@/components/wedding/story/pages/LogisticsPage';

interface RsvpEditLinkOpenerProps {
  token: string;
}

const MESSAGES = {
  missing: 'This link has expired or already been replaced by a newer one.',
  closed: 'RSVPs are closed now. If your plans changed, reach out to us directly.',
  error: "Couldn't open your RSVP right now — please try the link again."
};

// Emailed edit link (W-F6): unlock this device with the passcode the API returns, make the
// RSVP this device's own, then hand off to the normal RSVP page, which restores it.
export const RsvpEditLinkOpener = ({ token }: RsvpEditLinkOpenerProps) => {
  const router = useRouter();
  const [failure, setFailure] = useState<keyof typeof MESSAGES | undefined>();

  useEffect(() => {
    let cancelled = false;
    const open = async () => {
      const outcome = await openWeddingRsvpEditLink(token);
      if (cancelled) return;
      if (outcome.status !== 'ok') {
        setFailure(outcome.status);
        return;
      }

      if (outcome.code) {
        await fetch('/wedding/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: outcome.code })
        }).catch(() => undefined);
      }
      saveRsvpToThisDevice(outcome.rsvp);
      router.replace(WEDDING_RSVP_ROUTE);
    };

    open();
    return () => {
      cancelled = true;
    };
  }, [router, token]);

  return (
    <LogisticsPage kicker="Kindly Reply" title="Your RSVP">
      {failure ? (
        <>
          <p className="text-center">{MESSAGES[failure]}</p>
          {failure !== 'closed' && (
            <p className="text-center text-sm">
              <Link
                href={WEDDING_RSVP_FIND_ROUTE}
                className="text-[var(--sb-crimson)] underline underline-offset-4 hover:text-[var(--sb-gold-deep)]"
              >
                Get a new link
              </Link>
            </p>
          )}
        </>
      ) : (
        <p className="text-center">Opening your RSVP…</p>
      )}
    </LogisticsPage>
  );
};
