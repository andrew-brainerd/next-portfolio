'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { getTotal } from '@/utils/rollWithMeScoring';
import type { RollWithMeGame } from '@/types/rollWithMe';
import { TrophyIcon } from './icons/TrophyIcon';

interface GameOverProps {
  game: RollWithMeGame;
  myUid: string | undefined;
}

export const GameOver = ({ game, myUid }: GameOverProps) => {
  const p1Total = getTotal(game.player1.scores);
  const p2Total = game.player2 ? getTotal(game.player2.scores) : 0;

  let headline = 'Game over';
  let isWinner = false;
  if (game.type === 'versus' && game.player2) {
    if (p1Total === p2Total) headline = "It's a tie!";
    else {
      const winner = p1Total > p2Total ? game.player1 : game.player2;
      isWinner = winner.uid === myUid;
      headline = isWinner ? 'You win!' : `${winner.name} wins`;
    }
  } else {
    headline = 'Nice game!';
  }

  return (
    <div className="container mx-auto p-6 max-w-md text-center">
      <motion.div
        initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: isWinner ? [0, -8, 8, -4, 4, 0] : 0 }}
        transition={
          isWinner
            ? { duration: 0.9, type: 'spring', stiffness: 220, damping: 12 }
            : { duration: 0.4, type: 'spring', stiffness: 220 }
        }
        className="flex justify-center mb-4"
      >
        <TrophyIcon className="w-20 h-20" />
      </motion.div>
      <motion.h1
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="text-3xl font-bold mb-1"
      >
        {headline}
      </motion.h1>
      <p className="text-neutral-400 text-sm mb-6">{game.type === 'versus' ? 'Final scores' : 'Final score'}</p>
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4 mb-6 text-left">
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
