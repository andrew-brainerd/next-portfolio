'use client';

import { computeStandings } from '@/utils/buzzed';
import { Scoreboard } from '@/components/buzzed/Scoreboard';
import type { BuzzedGame } from '@/types/buzzed';

interface GameCompletedProps {
  game: BuzzedGame;
  currentUserId: string;
}

export const GameCompleted = ({ game, currentUserId }: GameCompletedProps) => {
  const standings = computeStandings(game);
  const top = standings[0];
  const outrightWinner = top && standings.filter(s => s.rank === 1).length === 1 ? top : undefined;
  const questionsPlayed = game.history.filter(q => q.state === 'resolved' || q.state === 'skipped').length;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-6 text-center">
        {outrightWinner ? (
          <>
            <p className="text-sm text-neutral-400">Winner</p>
            <p className="text-3xl font-bold text-white">🏆 {outrightWinner.displayName}</p>
            <p className="mt-1 text-sm text-neutral-400">
              {outrightWinner.score} {outrightWinner.score === 1 ? 'point' : 'points'}
            </p>
          </>
        ) : (
          <p className="text-2xl font-bold text-white">It’s a tie</p>
        )}
        <p className="mt-3 text-xs text-neutral-500">
          {questionsPlayed} {questionsPlayed === 1 ? 'question' : 'questions'} played
        </p>
      </div>

      <Scoreboard game={game} currentUserId={currentUserId} final />
    </div>
  );
};
