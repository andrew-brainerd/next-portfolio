'use client';

import { useEffect, useState } from 'react';

import { getWeddingQuizLeaderboard } from '@/api/wedding';
import type { QuizLeaderboard as Leaderboard } from '@/types/wedding';
import { formatZonedTime } from '@/utils/scheduleTime';
import { getWeddingClientId } from '@/utils/weddingClient';

// setTimeout's ceiling; later reveals are picked up on the next page load
const MAX_TIMEOUT_MS = 2_147_483_647;

interface QuizLeaderboardProps {
  closesAt?: string;
  timeZone: string;
}

export const QuizLeaderboard = ({ closesAt, timeZone }: QuizLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | undefined>();

  // Load now, then again right at the close so the reveal appears without a refresh
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getWeddingQuizLeaderboard(getWeddingClientId()).then(result => {
        if (!cancelled && result) setLeaderboard(result);
      });

    load();
    const untilClose = closesAt ? Date.parse(closesAt) - Date.now() : NaN;
    const timer =
      untilClose > 0 && untilClose < MAX_TIMEOUT_MS ? setTimeout(load, untilClose + 2000) : undefined;

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [closesAt]);

  if (!leaderboard) return null;

  if (!leaderboard.visible) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-[var(--sb-gold)] p-3 text-center font-garamond">
        {closesAt
          ? `Leaderboard revealed at ${formatZonedTime(Date.parse(closesAt), timeZone)}`
          : 'The leaderboard is a surprise — stay tuned!'}
      </p>
    );
  }

  return (
    <div className="mt-5">
      <h3 className="font-garamond text-xl text-[var(--sb-crimson)]">Leaderboard</h3>
      {leaderboard.me && (
        <p className="font-garamond">
          You placed #{leaderboard.me.rank} of {leaderboard.me.of}
        </p>
      )}
      {leaderboard.entries.length === 0 ? (
        <p className="mt-2 text-sm opacity-80">No official entries.</p>
      ) : (
        <ol className="mt-2 divide-y divide-[var(--sb-gold)]/40">
          {leaderboard.entries.map((entry, index) => (
            <li key={`${entry.name}-${entry.submittedAt}`} className="flex items-center gap-3 py-2">
              <span
                className={`w-8 shrink-0 text-center font-garamond text-lg ${index === 0 ? 'text-[var(--sb-gold-deep)]' : 'text-[var(--sb-crimson)]'}`}
              >
                {index === 0 ? '♛' : index + 1}
              </span>
              <span className="flex-1">{entry.name}</span>
              <span className="font-mono text-sm">
                {entry.score}/{entry.total}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
