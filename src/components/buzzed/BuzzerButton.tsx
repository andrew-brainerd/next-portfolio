'use client';

import { buzzBlockedReason, canBuzz, countdownSeconds } from '@/utils/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

interface BuzzerButtonProps {
  game: BuzzedGame;
  currentUserId: string;
  now: number;
  pending: boolean;
  onBuzz: () => void;
}

export const BuzzerButton = ({ game, currentUserId, now, pending, onBuzz }: BuzzerButtonProps) => {
  const live = canBuzz(game, currentUserId, now) && !pending;
  const reason = buzzBlockedReason(game, currentUserId, now);
  const countdown = countdownSeconds(game.playback.resumeAt, now);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onBuzz}
        disabled={!live}
        aria-label="Ring in"
        className={`flex aspect-square w-full max-w-xs items-center justify-center rounded-full text-3xl font-bold uppercase tracking-wider transition-all select-none ${
          live
            ? 'bg-red-600 text-white shadow-[0_0_60px_-10px] shadow-red-500/70 hover:bg-red-500 active:scale-95'
            : 'cursor-not-allowed bg-neutral-800 text-neutral-600'
        }`}
      >
        {countdown > 0 ? countdown : 'Buzz'}
      </button>

      <p className="h-5 text-sm text-neutral-400">{live ? 'Ring in!' : reason}</p>
    </div>
  );
};
