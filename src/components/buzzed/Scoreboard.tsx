'use client';

import { computeStandings, formatBuzzMs, medalForRank } from '@/utils/buzzed';
import { DEFAULT_BUZZER_COLOR } from '@/constants/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

interface ScoreboardProps {
  game: BuzzedGame;
  currentUserId: string;
  final?: boolean;
}

export const Scoreboard = ({ game, currentUserId, final = false }: ScoreboardProps) => {
  const standings = computeStandings(game);
  const lockedOut = game.currentQuestion?.lockedOutUserIds ?? [];
  const rungIn = game.currentQuestion?.state === 'locked' ? game.currentQuestion.lockedBy : undefined;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/60">
      <div className="border-b border-neutral-800 px-4 py-2">
        <h2 className="text-sm font-medium text-neutral-300">{final ? 'Final standings' : 'Scoreboard'}</h2>
      </div>
      <ul>
        {standings.map(row => {
          const isMe = row.userId === currentUserId;
          const isOut = lockedOut.includes(row.userId);
          const isRungIn = rungIn === row.userId;

          return (
            <li
              key={row.userId}
              className={`flex items-center gap-3 border-b border-neutral-800/60 px-4 py-2.5 last:border-b-0 ${
                isRungIn ? 'bg-brand-600/20' : ''
              }`}
            >
              <span className="w-6 shrink-0 text-sm text-neutral-500">
                {final && medalForRank(row.rank) ? medalForRank(row.rank) : row.rank}
              </span>

              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: row.color ?? DEFAULT_BUZZER_COLOR }}
              />

              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${isOut ? 'text-neutral-600 line-through' : 'text-white'}`}>
                  {row.displayName}
                  {isMe && <span className="ml-1.5 text-xs text-neutral-500">(you)</span>}
                </p>
                <p className="text-xs text-neutral-500">
                  {row.correct} correct · {row.wrong} wrong · {formatBuzzMs(row.avgBuzzMs)} avg
                </p>
              </div>

              {isRungIn && <span className="text-xs font-medium text-brand-400">rang in</span>}
              <span className="w-10 shrink-0 text-right text-lg font-semibold tabular-nums text-white">
                {row.score}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
