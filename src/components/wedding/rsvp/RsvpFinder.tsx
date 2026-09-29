'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { WEDDING_RSVP_ROUTE } from '@/constants/routes';
import { lookupWeddingRsvps, requestWeddingRsvpEdit } from '@/api/wedding';
import type { RsvpEditChannel, WeddingRsvpMatch } from '@/types/wedding';
import { saveRsvpToThisDevice } from '@/utils/weddingClient';
import { LogisticsPage } from '@/components/wedding/story/pages/LogisticsPage';

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-[var(--sb-gold)]/60 bg-[var(--sb-white)] px-3 py-2 text-[var(--sb-ink)] placeholder:text-neutral-400 focus:border-[var(--sb-gold)] focus:outline-none';

const CLOSED_MESSAGE = 'RSVPs are closed now. If your plans changed, reach out to us directly.';

// How the guest proves it's their RSVP: a link by email and/or text, or straight in when it has neither
const editChoices = (match: WeddingRsvpMatch): { channel: RsvpEditChannel; label: string }[] => {
  const choices: { channel: RsvpEditChannel; label: string }[] = [];
  if (match.hasEmail) choices.push({ channel: 'email', label: 'Email me a link' });
  if (match.hasPhone) choices.push({ channel: 'sms', label: 'Text me a link' });
  return choices.length > 0 ? choices : [{ channel: 'email', label: "That's me" }];
};

// Find-your-RSVP (W-F6, W-F7): search by name, email or phone, then edit via a link sent by email
// or text (or directly when the RSVP has neither). Editing reuses the RSVP page by adopting the RSVP on this device.
export const RsvpFinder = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<WeddingRsvpMatch[] | undefined>();
  const [busy, setBusy] = useState<string | undefined>(); // "<id>:<channel>" while a request is in flight
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

  const edit = async (match: WeddingRsvpMatch, channel: RsvpEditChannel) => {
    setBusy(`${match.id}:${channel}`);
    setMessage(undefined);
    const outcome = await requestWeddingRsvpEdit(match.id, channel);
    setBusy(undefined);

    if (outcome.status === 'direct') {
      saveRsvpToThisDevice(outcome.rsvp);
      router.push(WEDDING_RSVP_ROUTE);
    } else if (outcome.status === 'sent') {
      const how = outcome.channel === 'sms' ? 'texted' : 'emailed';
      setMessage(`We ${how} a link to ${outcome.maskedTo}. Open it to change your RSVP (it works for 24 hours).`);
    } else if (outcome.status === 'closed') {
      setMessage(CLOSED_MESSAGE);
    } else if (outcome.status === 'unavailable') {
      setMessage("That contact isn't on this RSVP — try the other option.");
    } else {
      setMessage("Couldn't open that RSVP — please search again.");
    }
  };

  return (
    <LogisticsPage kicker="Kindly Reply" title="Find your RSVP">
      <form onSubmit={search} className="space-y-3">
        <div>
          <label htmlFor="wedding-rsvp-find" className="block text-sm">
            Your name, email or phone
          </label>
          <input
            id="wedding-rsvp-find"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            minLength={3}
            maxLength={254}
            required
            placeholder="The name, email or phone you RSVP'd with"
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
                <span className="block text-sm text-[var(--sb-ink)]/70">Party of {match.partySize}</span>
              </span>
              <span className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                {editChoices(match).map(({ channel, label }) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => edit(match, channel)}
                    disabled={busy !== undefined}
                    className="rounded-lg border border-[var(--sb-crimson)] px-3 py-1.5 text-sm text-[var(--sb-crimson)] transition-colors hover:bg-[var(--sb-crimson)] hover:text-[var(--sb-white)] disabled:opacity-60"
                  >
                    {busy === `${match.id}:${channel}` ? 'One moment…' : label}
                  </button>
                ))}
              </span>
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
