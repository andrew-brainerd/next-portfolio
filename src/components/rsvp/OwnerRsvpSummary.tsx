'use client';

import { useEffect, useState } from 'react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import type { Rsvp, RsvpBreakdown, RsvpStatus } from '@/types/rsvp';
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
  const [tab, setTab] = useState<RsvpStatus>('going');

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

  const tabs: { key: RsvpStatus; label: string; rsvps: Rsvp[]; count: number }[] = [
    { key: 'going', label: 'Going', rsvps: breakdown.going, count: breakdown.counts.going },
    { key: 'maybe', label: 'Maybe', rsvps: breakdown.maybe, count: breakdown.counts.maybe },
    { key: 'no', label: "Can't make it", rsvps: breakdown.no, count: breakdown.counts.no }
  ];
  const active = tabs.find(t => t.key === tab) ?? tabs[0];

  return (
    <section className="rounded-lg border border-brand-600/50 bg-neutral-900/50 p-6">
      <h3 className="font-oswald text-xl uppercase tracking-wide text-neutral-100">Owner view — full breakdown</h3>
      <p className="mt-1 text-sm text-neutral-400">
        Total headcount: {breakdown.headcount} · Only you can see this.
      </p>

      <div role="tablist" aria-label="RSVP status" className="mt-4 flex flex-wrap gap-1 border-b border-neutral-700">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-brand-400 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-3">
        {active.rsvps.length === 0 ? (
          <p className="text-sm text-neutral-500">Nobody yet</p>
        ) : (
          <ul className="space-y-1 text-sm text-neutral-200">
            {active.rsvps.map(rsvp => (
              <li key={rsvp.clientId}>{formatRsvp(rsvp)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
