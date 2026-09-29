'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { WEDDING_RSVP_ROUTE } from '@/constants/routes';
import { lookupWeddingRsvps, requestWeddingRsvpEdit } from '@/api/wedding';
import type { WeddingRsvpMatch } from '@/types/wedding';
import { saveRsvpToThisDevice } from '@/utils/weddingClient';
import { LogisticsPage } from '@/components/wedding/story/pages/LogisticsPage';

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-[var(--sb-gold)]/60 bg-[var(--sb-white)] px-3 py-2 text-[var(--sb-ink)] placeholder:text-neutral-400 focus:border-[var(--sb-gold)] focus:outline-none';

const CLOSED_MESSAGE = 'RSVPs are closed now. If your plans changed, reach out to us directly.';

// Find-your-RSVP (W-F6): search by name or email, then edit via an emailed link (or directly
// when the RSVP has no email). Editing reuses the RSVP page by adopting the RSVP on this device.
export const RsvpFinder = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<WeddingRsvpMatch[] | undefined>();
  const [busyId, setBusyId] = useState<string | undefined>();
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim().length < 3 || searching) return;
    setSearching(true);
    setMessage(undefined);
    const outcome = await lookupWeddingRsvps(query.trim());
    setSearching(false);

    if (outcome.status === 'ok') setMatches(outcome.matches);
    else setMessage(outcome.status === 'closed' ? CLOSED_MESSAGE : "Couldn't search right now — please try again.");
  };

  const edit = async (match: WeddingRsvpMatch) => {
    setBusyId(match.id);
    setMessage(undefined);
    const outcome = await requestWeddingRsvpEdit(match.id);
    setBusyId(undefined);

    if (outcome.status === 'direct') {
      saveRsvpToThisDevice(outcome.rsvp);
      router.push(WEDDING_RSVP_ROUTE);
    } else if (outcome.status === 'sent') {
      setMessage(`We emailed a link to ${outcome.maskedEmail}. Open it to change your RSVP (it works for 24 hours).`);
    } else if (outcome.status === 'closed') {
      setMessage(CLOSED_MESSAGE);
    } else {
      setMessage("Couldn't open that RSVP — please search again.");
    }
  };

  return (
    <LogisticsPage kicker="Kindly Reply" title="Find your RSVP">
      <form onSubmit={search} className="space-y-3">
        <div>
          <label htmlFor="wedding-rsvp-find" className="block text-sm">
            Your name or email
          </label>
          <input
            id="wedding-rsvp-find"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            minLength={3}
            maxLength={254}
            required
            placeholder="The name or email you RSVP'd with"
            className={INPUT_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={searching || query.trim().length < 3}
          className="w-full rounded-lg bg-[var(--sb-crimson)] px-6 py-2.5 font-semibold text-[var(--sb-white)] transition-colors hover:bg-[#6d0505] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {matches && matches.length === 0 && (
        <p className="text-center">No RSVP found. Try the full name or email you used.</p>
      )}
      {matches && matches.length > 0 && (
        <ul className="space-y-2">
          {matches.map(match => (
            <li
              key={match.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--sb-gold)]/60 px-3 py-2"
            >
              <span>
                <span className="font-semibold">{match.name}</span>
                <span className="block text-sm text-[var(--sb-ink)]/70">
                  Party of {match.partySize}
                  {match.hasEmail ? ' · we\u2019ll email you a link' : ''}
                </span>
              </span>
              <button
                type="button"
                onClick={() => edit(match)}
                disabled={busyId !== undefined}
                className="shrink-0 rounded-lg border border-[var(--sb-crimson)] px-3 py-1.5 text-sm text-[var(--sb-crimson)] transition-colors hover:bg-[var(--sb-crimson)] hover:text-[var(--sb-white)] disabled:opacity-60"
              >
                {busyId === match.id ? 'One moment…' : "That's me"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p aria-live="polite" className="min-h-6 text-center">
        {message}
      </p>
    </LogisticsPage>
  );
};
