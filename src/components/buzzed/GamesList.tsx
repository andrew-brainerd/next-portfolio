'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { joinBuzzedGameByCode } from '@/api/buzzed';
import { BUZZED_NEW_ROUTE, BUZZED_ROUTE } from '@/constants/routes';
import { BUZZED_TARGET_LABELS } from '@/constants/buzzed';
import type { BuzzedGame } from '@/types/buzzed';

const JOIN_CODE_LENGTH = 5;

interface GamesListProps {
  games: BuzzedGame[];
}

export const GamesList = ({ games }: GamesListProps) => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const live = games.filter(g => g.status !== 'completed');
  const done = games.filter(g => g.status === 'completed');

  const onJoin = async () => {
    setPending(true);
    setError(null);
    try {
      const game = await joinBuzzedGameByCode(code.trim().toUpperCase());
      router.push(`${BUZZED_ROUTE}/${game.id}`);
    } catch {
      setError('No game with that code.');
      setPending(false);
    }
  };

  const renderGame = (game: BuzzedGame) => (
    <li key={game.id}>
      <Link
        href={`${BUZZED_ROUTE}/${game.id}`}
        className="flex items-center gap-3 border-b border-neutral-800/60 px-4 py-3 transition-colors hover:bg-neutral-800/40"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{game.name}</p>
          <p className="text-xs text-neutral-500">
            {game.players.length} {game.players.length === 1 ? 'player' : 'players'} ·{' '}
            {BUZZED_TARGET_LABELS[game.target]}
          </p>
        </div>
        <span className="shrink-0 text-xs text-neutral-500">
          {game.status === 'lobby' ? game.joinCode : game.status}
        </span>
      </Link>
    </li>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            value={code}
            maxLength={JOIN_CODE_LENGTH}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Join code"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono tracking-widest text-white uppercase placeholder:font-sans placeholder:tracking-normal placeholder:text-neutral-600 focus:border-brand-500 focus:outline-none"
          />
          <Button
            variant="outlined"
            disabled={pending || code.trim().length < JOIN_CODE_LENGTH}
            onClick={onJoin}
          >
            Join
          </Button>
        </div>
        <Button variant="contained" href={BUZZED_NEW_ROUTE}>
          New game
        </Button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {games.length === 0 ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          No games yet. Start one, or join with a code.
        </p>
      ) : (
        <>
          {live.length > 0 && (
            <ul className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
              {live.map(renderGame)}
            </ul>
          )}
          {done.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-neutral-400">Finished</h2>
              <ul className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
                {done.map(renderGame)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
