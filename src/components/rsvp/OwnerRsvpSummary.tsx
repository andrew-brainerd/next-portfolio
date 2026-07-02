'use client';

import { useEffect, useState } from 'react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import type { Rsvp, RsvpBreakdown } from '@/types/rsvp';
import { getAllRsvps } from '@/api/rsvp';

const formatRsvp = (rsvp: Rsvp): string => {
  if (rsvp.guests === 0) return rsvp.name;
  const namedGuests = rsvp.guestNames.filter(Boolean);
  const suffix = namedGuests.length > 0 ? ` +${rsvp.guests} (${namedGuests.join(', ')})` : ` +${rsvp.guests}`;
  return `${rsvp.name}${suffix}`;
};

export const OwnerRsvpSummary = () => {
  const { user } = useFirebaseUser();
  const [breakdown, setBreakdown] = useState<RsvpBreakdown | null>(null);

  useEffect(() => {
    if (!user) return;
    // The backend only answers for the configured owner uid — everyone else gets nothing
    let cancelled = false;
    getAllRsvps().then(result => {
      if (!cancelled) setBreakdown(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !breakdown) return null;

  const groups: { label: string; rsvps: Rsvp[] }[] = [
    { label: `Going (${breakdown.counts.going})`, rsvps: breakdown.going },
    { label: `Maybe (${breakdown.counts.maybe})`, rsvps: breakdown.maybe },
    { label: `Can't make it (${breakdown.counts.no})`, rsvps: breakdown.no }
  ];

  return (
    <section className="rounded-lg border border-brand-600/50 bg-neutral-900/50 p-6">
      <h3 className="font-oswald text-xl uppercase tracking-wide text-neutral-100">Owner view — full breakdown</h3>
      <p className="mt-1 text-sm text-neutral-400">
        Total headcount: {breakdown.headcount} · Only you can see this.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {groups.map(group => (
          <div key={group.label}>
            <h4 className="text-sm font-medium text-neutral-300">{group.label}</h4>
            {group.rsvps.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">Nobody yet</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-neutral-200">
                {group.rsvps.map(rsvp => (
                  <li key={rsvp.clientId}>{formatRsvp(rsvp)}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
