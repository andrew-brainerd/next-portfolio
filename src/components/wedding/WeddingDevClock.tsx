'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';

import { WEDDING_MOCK_OFFSET_COOKIE } from '@/constants/authentication';
import { WEDDING_ROUTE } from '@/constants/routes';
import { useNow } from '@/hooks/useNow';
import { isoToZonedLocal, zonedLocalToIso } from '@/utils/weddingGuide';
import { useWeddingClockOffset } from './WeddingClock';

const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);

interface WeddingDevClockProps {
  timeZone: string;
  initialNow: number;
  weddingDate: string; // "2027-11-19"; enables the Wedding day shortcut
}

// WEDDING_ADMINS only: pick a future date the storybook, guide and quiz API treat as "now"
export const WeddingDevClock = ({ timeZone, initialNow, weddingDate }: WeddingDevClockProps) => {
  const router = useRouter();
  const inputId = useId();
  const clockOffset = useWeddingClockOffset();
  const now = useNow(initialNow, clockOffset, 30_000);
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(() => isoToZonedLocal(new Date(initialNow).toISOString(), timeZone));
  const [error, setError] = useState<string | undefined>();

  const mocked = clockOffset > 0;
  const nowLabel = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(now);

  const saveOffset = (offsetMs: number) => {
    document.cookie =
      offsetMs > 0
        ? `${WEDDING_MOCK_OFFSET_COOKIE}=${offsetMs}; path=${WEDDING_ROUTE}; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax; secure`
        : `${WEDDING_MOCK_OFFSET_COOKIE}=; path=${WEDDING_ROUTE}; max-age=0`;
    router.refresh();
  };

  // Noon on the wedding day, venue time: the guide is open and the day's schedule is under way
  const weddingDayLocal = /^\d{4}-\d{2}-\d{2}$/.test(weddingDate) ? `${weddingDate}T12:00` : undefined;

  const apply = (target = local) => {
    const offset = Date.parse(zonedLocalToIso(target, timeZone)) - Date.now();
    if (!(offset > 0)) {
      setError('Pick a future date and time.');
      return;
    }
    setError(undefined);
    saveOffset(Math.round(offset));
  };

  return (
    <div className="fixed right-3 bottom-3 z-50 flex flex-col items-end font-sans text-sm text-white">
      {open && (
        <div className="mb-2 w-72 rounded-lg border border-neutral-700 bg-neutral-900/95 p-3 shadow-xl">
          <p className="font-semibold">Mock clock</p>
          <p className="mt-0.5 text-xs text-neutral-400">Admins only. Times are in {timeZone}.</p>
          <label htmlFor={inputId} className="mt-3 block text-xs text-neutral-300">
            Pretend it&apos;s
          </label>
          <input
            id={inputId}
            type="datetime-local"
            value={local}
            onChange={event => setLocal(event.target.value)}
            className="mt-1 w-full rounded border border-neutral-600 bg-neutral-800 px-2 py-1.5 text-white [color-scheme:dark]"
          />
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          {weddingDayLocal && (
            <button
              type="button"
              onClick={() => {
                setLocal(weddingDayLocal);
                apply(weddingDayLocal);
              }}
              className="mt-3 w-full rounded border border-amber-400/70 px-3 py-1.5 text-amber-300 hover:bg-amber-400/10"
            >
              Wedding day (noon)
            </button>
          )}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => apply()} className="flex-1 rounded bg-white px-3 py-1.5 font-medium text-neutral-900">
              Set
            </button>
            {mocked && (
              <button
                type="button"
                onClick={() => saveOffset(0)}
                className="flex-1 rounded border border-neutral-500 px-3 py-1.5"
              >
                Reset to real time
              </button>
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        className={`flex min-h-11 items-center gap-2 rounded-full px-4 shadow-lg ${
          mocked ? 'bg-amber-500 text-neutral-900' : 'bg-neutral-900/90'
        }`}
      >
        <ClockIcon />
        {mocked ? `Mock: ${nowLabel}` : 'Mock clock'}
      </button>
    </div>
  );
};
