'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { joinBuzzedGameByCode } from '@/api/buzzed';
import { BUZZED_ROUTE } from '@/constants/routes';
import { BUZZED_PLAYER_COLORS } from '@/constants/buzzed';
import { ColorPicker } from '@/components/buzzed/ColorPicker';
import type { BuzzedGame } from '@/types/buzzed';

interface JoinGameProps {
  game: BuzzedGame;
}

export const JoinGame = ({ game }: JoinGameProps) => {
  const router = useRouter();
  const taken = game.players.map(p => p.color).filter((c): c is string => !!c);
  const firstFree = BUZZED_PLAYER_COLORS.find(c => !taken.includes(c)) ?? BUZZED_PLAYER_COLORS[0];

  const [color, setColor] = useState<string>(firstFree);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const host = game.players.find(p => p.userId === game.ownerUserId);

  const onJoin = async () => {
    setPending(true);
    setError(null);
    try {
      await joinBuzzedGameByCode(game.joinCode, color);
      router.push(`${BUZZED_ROUTE}/${game.id}`);
    } catch {
      setError('Couldn’t join. Try again.');
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-6 text-center">
        <p className="text-sm text-neutral-400">You’ve been invited to</p>
        <h1 className="mt-1 text-2xl font-bold text-white">{game.name}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {game.players.length === 0
            ? 'Be the first to join'
            : `${game.players.length} ${game.players.length === 1 ? 'player' : 'players'} so far${
                host ? '' : ' · the host is just running the game'
              }`}
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm text-neutral-300">Pick your buzzer colour</p>
        <ColorPicker value={color} onChange={setColor} taken={taken} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button fullWidth variant="contained" disabled={pending} onClick={onJoin}>
        Join game
      </Button>
    </div>
  );
};
