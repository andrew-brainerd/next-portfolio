'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';

import type { PublicWeddingConfig, RsvpEditChannel, WeddingRsvpInput, WeddingRsvpStatus } from '@/types/wedding';
import { WEDDING_RSVP_CLIENT_ID_KEY, WEDDING_RSVP_SAVED_KEY, WEDDING_RSVP_STATUSES } from '@/constants/wedding';
import { WEDDING_RSVP_FIND_ROUTE } from '@/constants/routes';
import { submitWeddingRsvp } from '@/api/wedding';
import { useWeddingClockOffset } from '@/components/wedding/WeddingClock';
import { formatWeddingDate, isRsvpClosed, normalizePhone } from '@/utils/wedding';
import { LogisticsPage } from './LogisticsPage';

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-[var(--sb-gold)]/60 bg-[var(--sb-white)] px-3 py-2 text-[var(--sb-ink)] placeholder:text-neutral-400 focus:border-[var(--sb-gold)] focus:outline-none';

const CONFIRMATION: Record<WeddingRsvpStatus, string> = {
  going: "It's official — you're in the story. We can't wait to see you there!",
  maybe: "Thanks for letting us know — update this page whenever you're sure.",
  no: "We'll miss you! Thank you for telling us — you can change this later if plans shift."
};

const CONTACT_METHODS: { value: RsvpEditChannel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text' }
];

const resizeNames = (names: string[], count: number): string[] =>
  Array.from({ length: count }, (_, i) => names[i] ?? '');

interface RsvpPageProps {
  config: PublicWeddingConfig;
  closesAt?: number; // RSVP changes stop here (1 month before the wedding); brainerd-api enforces it too
}

// The RSVP page (W-F), served at /wedding/rsvp. Client component: clientId lives
// in localStorage so a returning guest edits their RSVP instead of duplicating it.
export const RsvpPage = ({ config, closesAt }: RsvpPageProps) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<WeddingRsvpStatus>('going');
  const [guestCount, setGuestCount] = useState(0);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // The one contact we keep (and require): where edit links go, and email gets confirmations
  const [contactMethod, setContactMethod] = useState<RsvpEditChannel>('email');
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clockOffset = useWeddingClockOffset();
  // Same clock read as isRsvpClosed's default, shifted by the mock clock
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now() + clockOffset;
  const closed = isRsvpClosed(config.rsvp.deadline, new Date(now)) || (closesAt !== undefined && now >= closesAt);
  const deadline = config.rsvp.deadline ? formatWeddingDate(config.rsvp.deadline) : '';

  useEffect(() => {
    // Hydrate the previous RSVP so a returning guest edits instead of duplicating
    // (deferred, matching RsvpForm — avoids setState-in-effect cascading renders)
    const hydrate = () => {
      try {
        const saved = window.localStorage.getItem(WEDDING_RSVP_SAVED_KEY);
        if (!saved) return;
        const rsvp = JSON.parse(saved) as WeddingRsvpInput;
        setName(rsvp.name ?? '');
        setStatus(rsvp.status ?? 'going');
        setGuestCount(rsvp.guestCount ?? 0);
        setGuestNames(resizeNames(rsvp.guestNames ?? [], rsvp.guestCount ?? 0));
        setNote(rsvp.note ?? '');
        setEmail(rsvp.email ?? '');
        setPhone(rsvp.phone ?? '');
        if (rsvp.phone && !rsvp.email) setContactMethod('sms');
      } catch {
        // Malformed saved RSVP — start fresh
      }
    };

    const timeout = setTimeout(hydrate, 0);
    return () => clearTimeout(timeout);
  }, []);

  const getClientId = (): string => {
    let clientId = window.localStorage.getItem(WEDDING_RSVP_CLIENT_ID_KEY);
    if (!clientId) {
      clientId = crypto.randomUUID();
      window.localStorage.setItem(WEDDING_RSVP_CLIENT_ID_KEY, clientId);
    }
    return clientId;
  };

  const setPlusOnes = (count: number) => {
    setGuestCount(count);
    setGuestNames(prev => resizeNames(prev, count));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSaving) return;
    if (contactMethod === 'sms' && !normalizePhone(phone)) {
      setError('Enter a 10-digit US phone number.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const input: WeddingRsvpInput = {
      clientId: getClientId(),
      name: trimmedName,
      status,
      guestCount: status === 'going' ? guestCount : 0,
      guestNames: status === 'going' ? guestNames.map(n => n.trim()) : [],
      note: note.trim() || undefined,
      // Only the chosen contact is kept; the other is cleared
      email: contactMethod === 'email' ? email.trim() : undefined,
      phone: contactMethod === 'sms' ? phone.trim() : undefined
    };

    const saved = await submitWeddingRsvp(input);
    setIsSaving(false);

    if (!saved) {
      setError('Something went wrong saving your RSVP — please try again.');
      return;
    }

    window.localStorage.setItem(WEDDING_RSVP_SAVED_KEY, JSON.stringify(input));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <LogisticsPage kicker="Kindly Reply" title="RSVP">
        <p className="text-center text-lg">{CONFIRMATION[status]}</p>
        {contactMethod === 'email' && email.trim() && (
          <p className="text-center text-sm">
            We sent a confirmation to <span className="font-semibold">{email.trim()}</span>.
          </p>
        )}
        <p className="text-center">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-sm text-[var(--sb-crimson)] underline underline-offset-4 hover:text-[var(--sb-gold-deep)]"
          >
            Change my answer
          </button>
        </p>
      </LogisticsPage>
    );
  }

  return (
    <LogisticsPage kicker="Kindly Reply" title="RSVP">
      {config.rsvp.message && <p className="text-center italic">{config.rsvp.message}</p>}
      {deadline && (
        <p className="text-center text-sm">
          Please reply by <span className="font-semibold text-[var(--sb-crimson)]">{deadline}</span>
        </p>
      )}

      {closed ? (
        <p className="text-center">
          The RSVP window has closed — if your plans changed, reach out to us directly and we&apos;ll sort it out.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="wedding-rsvp-name" className="block text-sm">
              Your name
            </label>
            <input
              id="wedding-rsvp-name"
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              required
              maxLength={80}
              placeholder="First and last name"
              className={INPUT_CLASS}
            />
          </div>

          <fieldset>
            <legend className="text-sm">How should we reach you?</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CONTACT_METHODS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setContactMethod(option.value)}
                  aria-pressed={contactMethod === option.value}
                  className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                    contactMethod === option.value
                      ? 'border-[var(--sb-crimson)] bg-[var(--sb-crimson)] text-[var(--sb-white)]'
                      : 'border-[var(--sb-gold)]/60 bg-[var(--sb-white)] text-[var(--sb-ink)] hover:border-[var(--sb-gold)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {contactMethod === 'email' ? (
            <div>
              <label htmlFor="wedding-rsvp-email" className="block text-sm">
                Email <span aria-hidden="true" className="text-[var(--sb-crimson)]">*</span>
              </label>
              <input
                id="wedding-rsvp-email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                maxLength={254}
                autoComplete="email"
                placeholder="We'll send you a confirmation"
                className={INPUT_CLASS}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="wedding-rsvp-phone" className="block text-sm">
                Phone (US) <span aria-hidden="true" className="text-[var(--sb-crimson)]">*</span>
              </label>
              <input
                id="wedding-rsvp-phone"
                type="tel"
                value={phone}
                onChange={event => setPhone(event.target.value)}
                required
                maxLength={20}
                autoComplete="tel"
                inputMode="tel"
                placeholder="To find your RSVP later by text"
                className={INPUT_CLASS}
              />
            </div>
          )}

          <fieldset>
            <legend className="text-sm">Will you be there?</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {WEDDING_RSVP_STATUSES.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  aria-pressed={status === option.value}
                  className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                    status === option.value
                      ? 'border-[var(--sb-crimson)] bg-[var(--sb-crimson)] text-[var(--sb-white)]'
                      : 'border-[var(--sb-gold)]/60 bg-[var(--sb-white)] text-[var(--sb-ink)] hover:border-[var(--sb-gold)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {status === 'going' && (
            <>
              <div>
                <label htmlFor="wedding-rsvp-guests" className="block text-sm">
                  Plus-ones (from your invitation)
                </label>
                <select
                  id="wedding-rsvp-guests"
                  value={guestCount}
                  onChange={event => setPlusOnes(Number(event.target.value))}
                  className={INPUT_CLASS}
                >
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>
                      {n === 0 ? 'Just me' : `+${n}`}
                    </option>
                  ))}
                </select>
              </div>
              {guestNames.map((guestName, index) => (
                <div key={index}>
                  <label htmlFor={`wedding-rsvp-guest-${index}`} className="block text-sm">
                    Guest {index + 1} name
                  </label>
                  <input
                    id={`wedding-rsvp-guest-${index}`}
                    type="text"
                    value={guestName}
                    onChange={event =>
                      setGuestNames(prev => prev.map((n, i) => (i === index ? event.target.value : n)))
                    }
                    maxLength={80}
                    className={INPUT_CLASS}
                  />
                </div>
              ))}
            </>
          )}

          <div>
            <label htmlFor="wedding-rsvp-note" className="block text-sm">
              Dietary restrictions or a note (optional)
            </label>
            <textarea
              id="wedding-rsvp-note"
              value={note}
              onChange={event => setNote(event.target.value)}
              rows={2}
              maxLength={500}
              className={INPUT_CLASS}
            />
          </div>

          {error && <p className="text-center text-sm text-[var(--sb-crimson)]">{error}</p>}

          <button
            type="submit"
            disabled={isSaving || name.trim().length === 0}
            className="w-full rounded-lg bg-[var(--sb-crimson)] px-6 py-2.5 font-semibold text-[var(--sb-white)] transition-colors hover:bg-[#6d0505] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Sending…' : 'Send RSVP'}
          </button>
        </form>
      )}
      {!closed && (
        <p className="text-center text-sm">
          Already RSVP&apos;d on another device?{' '}
          <Link
            href={WEDDING_RSVP_FIND_ROUTE}
            className="text-[var(--sb-crimson)] underline underline-offset-4 hover:text-[var(--sb-gold-deep)]"
          >
            Find your RSVP
          </Link>
        </p>
      )}
    </LogisticsPage>
  );
};
