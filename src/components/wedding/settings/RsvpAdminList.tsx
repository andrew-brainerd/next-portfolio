import type { WeddingRsvp, WeddingRsvpBreakdown } from '@/types/wedding';

const formatGuestLine = (rsvp: WeddingRsvp): string => {
  if (rsvp.guestCount === 0) return rsvp.name;
  const named = rsvp.guestNames.filter(Boolean);
  const suffix = named.length > 0 ? ` +${rsvp.guestCount} (${named.join(', ')})` : ` +${rsvp.guestCount}`;
  return `${rsvp.name}${suffix}`;
};

interface RsvpGroupProps {
  title: string;
  rsvps: WeddingRsvp[];
}

const RsvpGroup = ({ title, rsvps }: RsvpGroupProps) => (
  <div>
    <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
      {title} ({rsvps.length})
    </h3>
    {rsvps.length === 0 ? (
      <p className="mt-1 text-sm text-neutral-500">No responses yet.</p>
    ) : (
      <ul className="mt-1 space-y-1">
        {rsvps.map(rsvp => (
          <li key={rsvp.id ?? rsvp.clientId} className="text-sm text-neutral-200">
            {formatGuestLine(rsvp)}
            {rsvp.note && <span className="ml-2 text-neutral-400">— {rsvp.note}</span>}
          </li>
        ))}
      </ul>
    )}
  </div>
);

interface RsvpAdminListProps {
  breakdown: WeddingRsvpBreakdown;
}

// Owner view of guest RSVPs on /wedding/settings (server-fetched, owner-gated
// by the backend — non-owners never receive a breakdown to render).
export const RsvpAdminList = ({ breakdown }: RsvpAdminListProps) => (
  <section className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-5">
    <h2 className="text-lg font-semibold text-neutral-100">Guest RSVPs</h2>
    <p className="mt-1 text-sm text-neutral-400">
      Total headcount (going + plus-ones): <span className="font-semibold text-neutral-200">{breakdown.headcount}</span>
    </p>
    <div className="mt-4 space-y-4">
      <RsvpGroup title="Going" rsvps={breakdown.going} />
      <RsvpGroup title="Maybe" rsvps={breakdown.maybe} />
      <RsvpGroup title="Can't make it" rsvps={breakdown.no} />
    </div>
  </section>
);
