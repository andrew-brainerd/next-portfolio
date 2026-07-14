'use client';

import Link from 'next/link';
import Button from '@mui/material/Button';

import { computeStandings, formatBuzzMs, medalForRank } from '@/utils/buzzed';
import { BUZZED_NEW_ROUTE, BUZZED_ROUTE } from '@/constants/routes';
import { DEFAULT_BUZZER_COLOR } from '@/constants/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

interface GameResultsProps {
  game: BuzzedGame;
  currentUserId: string;
}

export const GameResults = ({ game, currentUserId }: GameResultsProps) => {
  const standings = computeStandings(game);
  const winners = standings.filter(s => s.rank === 1);
  const outright = winners.length === 1 ? winners[0] : undefined;

  const questionsPlayed = game.history.length;
  const totalBuzzes = game.history.reduce((sum, q) => sum + q.ringIns.length, 0);
  const fastest = game.history
    .flatMap(q => q.ringIns)
    .filter(r => r.grade === 'correct' && r.buzzMs > 0)
    .sort((a, b) => a.buzzMs - b.buzzMs)[0];
  const fastestName = game.players.find(p => p.userId === fastest?.userId)?.displayName;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-8 text-center">
        {/* A display name can be a full email address — fixed height so it can't blow the card out. */}
        {outright ? (
          <>
            <p className="text-sm text-neutral-400">Winner</p>
            <p className="mt-1 max-h-28 overflow-y-auto overflow-x-hidden break-words text-4xl font-bold text-white">
              🏆 {outright.displayName}
            </p>
            <p className="mt-2 text-neutral-400">
              {outright.score} {outright.score === 1 ? 'point' : 'points'}
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-white">It’s a tie</p>
            <p className="mt-2 max-h-28 overflow-y-auto overflow-x-hidden break-words text-neutral-400">
              {winners.map(w => w.displayName).join(' · ')}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Questions', value: String(questionsPlayed) },
          { label: 'Ring-ins', value: String(totalBuzzes) },
          { label: 'Fastest', value: fastest ? formatBuzzMs(fastest.buzzMs) : '—', sub: fastestName }
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-center"
          >
            <p className="text-xl font-semibold text-white">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.label}</p>
            {stat.sub && <p className="truncate text-xs text-neutral-600">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60">
        <div className="border-b border-neutral-800 px-4 py-2">
          <h2 className="text-sm font-medium text-neutral-300">Final standings</h2>
        </div>
        <ul>
          {standings.map(row => (
            <li
              key={row.userId}
              className="flex items-center gap-3 border-b border-neutral-800/60 px-4 py-3 last:border-b-0"
            >
              <span className="w-7 shrink-0 text-center text-sm text-neutral-500">
                {medalForRank(row.rank) || row.rank}
              </span>

              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: row.color ?? DEFAULT_BUZZER_COLOR }}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">
                  {row.displayName}
                  {row.userId === currentUserId && (
                    <span className="ml-1.5 text-xs text-neutral-500">(you)</span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  {row.correct} correct · {row.ringIns} ring-ins · {formatBuzzMs(row.avgBuzzMs)} avg
                </p>
              </div>

              <span className="w-10 shrink-0 text-right text-xl font-semibold tabular-nums text-white">
                {row.score}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Button fullWidth variant="outlined" component={Link} href={BUZZED_ROUTE}>
          Back to games
        </Button>
        <Button fullWidth variant="contained" component={Link} href={BUZZED_NEW_ROUTE}>
          New game
        </Button>
      </div>
    </div>
  );
};
