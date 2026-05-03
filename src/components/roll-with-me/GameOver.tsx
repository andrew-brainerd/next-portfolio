'use client';

import Link from 'next/link';
import { ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { getTotal } from '@/utils/rollWithMeScoring';
import type { RollWithMeGame } from '@/types/rollWithMe';

interface GameOverProps {
  game: RollWithMeGame;
  myUid: string | undefined;
}

export const GameOver = ({ game, myUid }: GameOverProps) => {
  const p1Total = getTotal(game.player1.scores);
  const p2Total = game.player2 ? getTotal(game.player2.scores) : 0;

  let headline = 'Game over';
  if (game.type === 'versus' && game.player2) {
    if (p1Total === p2Total) headline = "It's a tie!";
    else {
      const winner = p1Total > p2Total ? game.player1 : game.player2;
      headline = winner.uid === myUid ? 'You win! 🎉' : `${winner.name} wins`;
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-md text-center">
      <h1 className="text-3xl font-bold mb-4">{headline}</h1>
      <div className="bg-neutral-900 border border-neutral-700 rounded-md p-4 mb-6 text-left">
        <div className="flex justify-between py-1">
          <span>{game.player1.name}</span>
          <span className="font-semibold">{p1Total}</span>
        </div>
        {game.player2 && (
          <div className="flex justify-between py-1">
            <span>{game.player2.name}</span>
            <span className="font-semibold">{p2Total}</span>
          </div>
        )}
      </div>
      <Link
        href={ROLL_WITH_ME_ROUTE}
        className="inline-block bg-brand-500 hover:bg-brand-400 text-white px-5 py-2.5 rounded-md"
      >
        Back to menu
      </Link>
    </div>
  );
};
