import type { RsvpGuestBook } from '@/types/rsvp';

interface GuestBookProps {
  guestBook?: RsvpGuestBook;
}

export const GuestBook = ({ guestBook }: GuestBookProps) => (
  <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-xl">
    <h3 className="font-oswald text-xl uppercase tracking-wide text-neutral-100">Who&apos;s going</h3>

    {!guestBook ? (
      <p className="mt-4 text-neutral-400">Couldn&apos;t load the guest book — check back soon.</p>
    ) : guestBook.going.length === 0 ? (
      <p className="mt-4 text-neutral-400">No RSVPs yet — be the first!</p>
    ) : (
      <>
        <ul className="mt-4 space-y-1 text-neutral-200">
          {guestBook.going.map((entry, index) => {
            const namedGuests = entry.guestNames.filter(Boolean);
            return (
              <li key={`${entry.name}-${index}`}>
                {entry.name}
                {entry.guests > 0 && <span className="text-neutral-400"> +{entry.guests}</span>}
                {namedGuests.length > 0 && (
                  <span className="text-neutral-500"> ({namedGuests.join(', ')})</span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-neutral-400">
          {guestBook.headcount} {guestBook.headcount === 1 ? 'person' : 'people'} so far
        </p>
      </>
    )}
  </section>
);
