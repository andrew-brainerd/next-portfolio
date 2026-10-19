'use client';

import { useState } from 'react';

import { sanitizeInitials } from '@/utils/plowedLeaderboard';

const INITIALS_KEY = 'plowed:initials';

const readInitials = () => {
  try {
    return sanitizeInitials(window.localStorage.getItem(INITIALS_KEY) ?? '');
  } catch {
    return '';
  }
};

const writeInitials = (initials: string) => {
  try {
    window.localStorage.setItem(INITIALS_KEY, initials);
  } catch {
    // Storage unavailable (private mode); initials just won't prefill next time.
  }
};

interface PlowedInitialsEntryProps {
  onSubmit: (initials: string) => Promise<void>;
  onSkip: () => void;
}

export const PlowedInitialsEntry = ({ onSubmit, onSkip }: PlowedInitialsEntryProps) => {
  const [initials, setInitials] = useState(readInitials);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (initials.length !== 3 || submitting) return;
    setSubmitting(true);
    setError(false);
    writeInitials(initials);
    try {
      await onSubmit(initials);
    } catch {
      setError(true);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col items-center gap-2">
      <label htmlFor="plowed-initials" className="font-mono text-sm text-amber-300">
        New high score! Enter your initials
      </label>
      <input
        id="plowed-initials"
        value={initials}
        onChange={event => setInitials(sanitizeInitials(event.target.value))}
        autoFocus
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={3}
        placeholder="AAA"
        className="w-28 rounded border border-neutral-500 bg-neutral-900 px-2 py-1 text-center font-mono text-3xl tracking-[0.4em] text-white uppercase placeholder:text-neutral-600"
      />
      {error && <p className="text-xs text-red-400">Couldn&apos;t save your score. Try again?</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={initials.length !== 3 || submitting}
          className="rounded bg-amber-400 px-4 py-1 font-mono font-bold text-neutral-900 hover:bg-amber-300 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded px-3 py-1 font-mono text-neutral-300 hover:text-white"
        >
          Skip
        </button>
      </div>
    </form>
  );
};
