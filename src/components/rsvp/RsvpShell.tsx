'use client';

import { useCallback, useEffect, useState } from 'react';
import { RSVP_SAVED_KEY } from '@/constants/rsvp';
import type { RsvpGuestBook } from '@/types/rsvp';
import { getGuestBook } from '@/api/rsvp';
import { Modal } from '@/components/peapod/Modal';
import { RsvpForm } from './RsvpForm';
import { GuestBook } from './GuestBook';
import { OwnerRsvpSummary } from './OwnerRsvpSummary';

interface RsvpShellProps {
  initialGuestBook?: RsvpGuestBook;
}

export const RsvpShell = ({ initialGuestBook }: RsvpShellProps) => {
  const [guestBook, setGuestBook] = useState(initialGuestBook);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [guestBookOpen, setGuestBookOpen] = useState(false);
  const [hasRsvped, setHasRsvped] = useState(false);

  const refresh = useCallback(async () => {
    const latest = await getGuestBook();
    if (latest) setGuestBook(latest);
  }, []);

  useEffect(() => {
    // Refetch on mount — the server-side prefetch can fail where the browser
    // fetch succeeds (e.g. local dev, API bound to IPv4 loopback only) — and
    // on window focus, since there's no realtime in v1 (spec §4)
    const timeout = setTimeout(() => {
      refresh();
      // A returning guest (RSVP saved in localStorage) has already RSVP'd, so
      // reveal the guest list for them on load too
      if (window.localStorage.getItem(RSVP_SAVED_KEY)) setHasRsvped(true);
    }, 0);
    window.addEventListener('focus', refresh);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  const handleRsvpSubmitted = useCallback(() => {
    setHasRsvped(true);
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => setRsvpOpen(true)}
          className="rounded-xl bg-brand-600 px-10 py-4 text-lg font-semibold text-neutral-100 shadow-lg transition-colors hover:bg-brand-700"
        >
          RSVP Here
        </button>
        {hasRsvped && (
          <button
            type="button"
            onClick={() => setGuestBookOpen(true)}
            className="rounded-xl border border-neutral-700 bg-neutral-900/50 px-8 py-4 text-lg font-semibold text-neutral-100 transition-colors hover:bg-neutral-800"
          >
            See who&apos;s going
          </button>
        )}
      </div>

      <OwnerRsvpSummary />

      <Modal isOpen={rsvpOpen} onClose={() => setRsvpOpen(false)}>
        <RsvpForm onSubmitted={handleRsvpSubmitted} onClose={() => setRsvpOpen(false)} />
      </Modal>

      <Modal isOpen={guestBookOpen} onClose={() => setGuestBookOpen(false)}>
        <GuestBook guestBook={guestBook} />
      </Modal>
    </div>
  );
};
