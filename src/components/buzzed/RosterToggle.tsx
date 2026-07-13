'use client';

import { useState } from 'react';

import { getBuzzedGame, joinBuzzedGame, leaveBuzzedRoster } from '@/api/buzzed';
import { BUZZED_PLAYER_COLORS } from '@/constants/buzzed';
import { isOnRoster } from '@/utils/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

interface RosterToggleProps {
  game: BuzzedGame;
  currentUserId: string;
  onChange: (game: BuzzedGame) => void;
  className?: string;
}

export const RosterToggle = ({ game, currentUserId, onChange, className }: RosterToggleProps) => {
  const [pending, setPending] = useState(false);

  const playing = isOnRoster(game, currentUserId);
  const taken = game.players.map(p => p.color).filter((c): c is string => !!c);

  const onToggle = async () => {
    setPending(true);
    try {
      if (playing) {
        await leaveBuzzedRoster(game.id);
      } else {
        const free = BUZZED_PLAYER_COLORS.find(c => !taken.includes(c)) ?? BUZZED_PLAYER_COLORS[0];
        await joinBuzzedGame(game.id, free);
      }
      const fresh = await getBuzzedGame(game.id);
      if (fresh) onChange(fresh);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onToggle}
      className={
        className ?? 'text-xs text-neutral-400 underline hover:text-white disabled:opacity-50'
      }
    >
      {playing ? 'Sit out' : 'Join in'}
    </button>
  );
};
