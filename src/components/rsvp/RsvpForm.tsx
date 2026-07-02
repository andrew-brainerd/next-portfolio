'use client';

import { FormEvent, useEffect, useState } from 'react';
import { RSVP_CLIENT_ID_KEY, RSVP_SAVED_KEY } from '@/constants/rsvp';
import type { RsvpInput, RsvpStatus } from '@/types/rsvp';
import { submitRsvp } from '@/api/rsvp';
import { NumberInput } from '@/components/scorebook/NumberInput';

const MAX_GUESTS = 20;

// Resize the per-plus-one name array to a new count, preserving existing entries
const resizeNames = (names: string[], count: number): string[] =>
  Array.from({ length: count }, (_, i) => names[i] ?? '');

const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: 'going', label: 'Going' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: "Can't make it" }
];

// Post-submit confirmation copy — the surprise reminder now lands here (after the
// guest commits) instead of pre-emptively when they pick a status.
const CONFIRMATION: Record<RsvpStatus, { title: string; reminder: string }> = {
  going: {
    title: "Can't wait to see you! 🎉",
    reminder: "Remember — it's a surprise, so please don't say anything to Hayley!"
  },
  maybe: {
    title: 'Thanks for letting us know!',
    reminder: "If you can make it, remember it's a surprise — please don't mention it to Hayley."
  },
  no: {
    title: "Sorry you'll miss it!",
    reminder: "Please keep it under wraps — don't mention the party to Hayley."
  }
};

interface RsvpFormProps {
  onSubmitted: () => void;
  onClose?: () => void;
}

export const RsvpForm = ({ onSubmitted, onClose }: RsvpFormProps) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<RsvpStatus>('going');
  const [statusTouched, setStatusTouched] = useState(false);
  const [guests, setGuests] = useState(0);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate the previous RSVP so a returning guest edits instead of duplicating
    const hydrate = () => {
      try {
        const saved = window.localStorage.getItem(RSVP_SAVED_KEY);
        if (!saved) return;
        const rsvp = JSON.parse(saved) as RsvpInput;
        setName(rsvp.name ?? '');
        setStatus(rsvp.status ?? 'going');
        setGuests(rsvp.guests ?? 0);
        setGuestNames(resizeNames(rsvp.guestNames ?? [], rsvp.guests ?? 0));
        setIsReturning(true);
      } catch {
        // Malformed saved RSVP — start fresh
      }
    };

    const timeout = setTimeout(hydrate, 0);
    return () => clearTimeout(timeout);
  }, []);

  const setGuestCount = (count: number) => {
    setGuests(count);
    setGuestNames(prev => resizeNames(prev, count));
  };

  const setGuestName = (index: number, value: string) => {
    setGuestNames(prev => prev.map((n, i) => (i === index ? value : n)));
  };

  const getClientId = (): string => {
    let clientId = window.localStorage.getItem(RSVP_CLIENT_ID_KEY);
    if (!clientId) {
      clientId = crypto.randomUUID();
      window.localStorage.setItem(RSVP_CLIENT_ID_KEY, clientId);
    }
    return clientId;
  };

  // Every plus-one needs a name before a Going RSVP can be sent
  const guestNamesComplete = status !== 'going' || guestNames.every(n => n.trim().length > 0);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSaving || !guestNamesComplete) return;

    setIsSaving(true);
    setError(null);

    const input: RsvpInput = {
      clientId: getClientId(),
      name: trimmedName,
      status,
      guests: status === 'going' ? guests : 0,
      guestNames: status === 'going' ? guestNames.map(n => n.trim()) : []
    };

    const saved = await submitRsvp(input);
    setIsSaving(false);

    if (!saved) {
      setError('Something went wrong saving your RSVP — please try again.');
      return;
    }

    window.localStorage.setItem(RSVP_SAVED_KEY, JSON.stringify(input));
    setIsReturning(true);
    setSubmitted(true);
    onSubmitted();
  };

  if (submitted) {
    const confirmation = CONFIRMATION[status];
    return (
      <section className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-xl">
        <h3 className="animate-fade-in-up font-oswald text-2xl uppercase tracking-wide text-neutral-100">
          {confirmation.title}
        </h3>
        <p className="animate-fade-in-up mt-4 rounded-lg border border-warning-700/60 bg-warning-400/10 p-3 text-sm text-warning-100">
          🤫 {confirmation.reminder}
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="rounded-lg border border-neutral-700 bg-neutral-950/50 px-4 py-2 text-neutral-200 transition-colors hover:bg-neutral-800"
          >
            Edit my RSVP
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-brand-600 px-6 py-2 font-medium text-neutral-100 transition-colors hover:bg-brand-700"
            >
              Done
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-xl">
      <h3 className="font-oswald text-xl uppercase tracking-wide text-neutral-100">
        {isReturning ? 'Update your RSVP' : 'RSVP'}
      </h3>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="rsvp-name" className="block text-sm text-neutral-300">
            Your name
          </label>
          <input
            id="rsvp-name"
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            required
            maxLength={80}
            placeholder="First and last name"
            className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-brand-400 focus:outline-none"
          />
        </div>

        <fieldset>
          <legend className="text-sm text-neutral-300">Will you be there?</legend>
          <div className="mt-2 flex gap-2">
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatus(option.value);
                  setStatusTouched(true);
                }}
                aria-pressed={status === option.value}
                className={`rounded-lg border px-4 py-2 transition-colors ${
                  status === option.value
                    ? 'border-brand-400 bg-brand-600/30 text-neutral-100'
                    : 'border-neutral-700 bg-neutral-950/50 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Going gets its reminder post-submit; Maybe / Can't-make-it get it on select */}
        {statusTouched && status !== 'going' && (
          <p
            role="alert"
            className="animate-fade-in-up rounded-lg border border-warning-700/60 bg-warning-400/10 p-3 text-sm text-warning-100"
          >
            🤫 Remember — it&apos;s still a surprise for Hayley. Please don&apos;t say anything to her!
          </p>
        )}

        {status === 'going' && (
          <div>
            <span className="block text-sm text-neutral-300">Bringing anyone? (number of plus-ones)</span>
            <div className="mt-1">
              <NumberInput value={guests} onChange={setGuestCount} min={0} max={MAX_GUESTS} ariaLabel="Plus-ones" />
            </div>
          </div>
        )}

        {status === 'going' && guests > 0 && (
          <div className="space-y-2">
            <span className="block text-sm text-neutral-300">Who are you bringing?</span>
            {guestNames.map((guestName, index) => (
              <input
                key={index}
                type="text"
                value={guestName}
                onChange={event => setGuestName(index, event.target.value)}
                required
                maxLength={80}
                placeholder={`Guest ${index + 1} name`}
                aria-label={`Guest ${index + 1} name`}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-brand-400 focus:outline-none"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving || !name.trim() || !guestNamesComplete}
          className="rounded-lg bg-brand-600 px-6 py-2 font-medium text-neutral-100 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : isReturning ? 'Update RSVP' : 'Send RSVP'}
        </button>

        {error && <p className="text-sm text-neutral-200">{error}</p>}
        {isReturning && !error && (
          <p className="text-sm text-neutral-500">You can update your RSVP from this device any time.</p>
        )}
      </form>
    </section>
  );
};
