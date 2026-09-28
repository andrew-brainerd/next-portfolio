'use client';

import { useNow } from '@/hooks/useNow';
import type { ScheduleItem } from '@/types/wedding';
import { formatZonedTime, getNowNext } from '@/utils/scheduleTime';

interface NowNextCardProps {
  schedule: ScheduleItem[];
  weddingDate: string;
  timeZone: string;
  initialNow: number;
  showMessageLink: boolean;
}

export const NowNextCard = ({ schedule, weddingDate, timeZone, initialNow, showMessageLink }: NowNextCardProps) => {
  const now = useNow(initialNow);
  const state = getNowNext(schedule, weddingDate, timeZone, now);

  if (state.phase === 'unknown') return null;

  return (
    <section
      aria-live="polite"
      className="rounded-xl border-2 border-[var(--sb-gold)] bg-[var(--sb-crimson)] p-5 text-center text-[var(--sb-white)] shadow-md"
    >
      {state.phase === 'before' && (
        <p className="font-garamond text-2xl">
          {state.daysUntil === 1 ? 'See you tomorrow!' : `See you in ${state.daysUntil} days`}
        </p>
      )}

      {state.phase === 'day' && (
        <div className="space-y-2">
          {state.current && (
            <div>
              <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-gold)]">Happening now</p>
              <p className="font-garamond text-2xl">{state.current.title}</p>
            </div>
          )}
          {state.next && (
            <p className="font-garamond text-lg text-[var(--sb-cream)]">
              {state.current ? 'Next' : 'Up next'}: {state.next.title}
              {state.nextStartsAt !== undefined && ` at ${formatZonedTime(state.nextStartsAt, timeZone)}`}
            </p>
          )}
          {!state.current && !state.next && <p className="font-garamond text-2xl">Enjoy the celebration!</p>}
        </div>
      )}

      {state.phase === 'after' && (
        <div className="space-y-2">
          <p className="font-garamond text-2xl">Thanks for celebrating with us</p>
          {showMessageLink && (
            <a href="#messages" className="inline-block font-garamond text-[var(--sb-gold)] underline underline-offset-4">
              Leave us a note
            </a>
          )}
        </div>
      )}
    </section>
  );
};
