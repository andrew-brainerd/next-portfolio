'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { listGames, createGame, deleteGame } from '@/api/rollWithMe';
import { ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { isMyTurn, getOpponent } from '@/hooks/useRollWithMeStore';
import { getTotal } from '@/utils/rollWithMeScoring';
import type { GameType, RollWithMeGame } from '@/types/rollWithMe';
import { StatusPill, type StatusVariant } from './StatusPill';
import { SoloIcon } from './icons/SoloIcon';
import { VersusIcon } from './icons/VersusIcon';
import { DiceEmptyIcon } from './icons/DiceEmptyIcon';
import { TrashIcon } from './icons/TrashIcon';

interface GameStatus {
  variant: StatusVariant;
  label: string;
}

const gameStatus = (game: RollWithMeGame, uid: string | undefined): GameStatus => {
  if (game.isGameOver) return { variant: 'game-over', label: 'Game Over' };
  if (game.type === 'versus' && !game.player2) return { variant: 'waiting', label: 'Waiting' };
  if (isMyTurn(game, uid)) return { variant: 'your-turn', label: 'Your turn' };
  return { variant: 'their-turn', label: "Their turn" };
};

const subtitle = (game: RollWithMeGame, uid: string | undefined): string => {
  if (game.type === 'solo') return 'Solo';
  const opponent = getOpponent(game, uid);
  if (!opponent) return 'Versus';
  return `vs. ${opponent.name}`;
};

const EmptyState = () => (
  <div className="bg-neutral-900/60 border border-dashed border-neutral-700 rounded-xl p-10 text-center">
    <div className="flex justify-center mb-4 opacity-70">
      <DiceEmptyIcon className="w-16 h-16" />
    </div>
    <p className="text-neutral-300 font-medium">No games yet</p>
    <p className="text-neutral-500 text-sm mt-1">Start one above to roll your first dice.</p>
  </div>
);

const SkeletonRow = () => (
  <li className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-10 h-10 bg-neutral-800 rounded-md" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 bg-neutral-800 rounded" />
      <div className="h-3 w-20 bg-neutral-800 rounded" />
    </div>
    <div className="h-6 w-20 bg-neutral-800 rounded-full" />
  </li>
);

interface NewGameCardProps {
  type: GameType;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}

const NewGameCard = ({ type, title, subtitle, illustration, disabled, onClick }: NewGameCardProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={`New ${type} game`}
    className="group flex-1 bg-neutral-800/80 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-700 hover:border-brand-400 rounded-xl p-4 sm:p-5 text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">{illustration}</div>
      <div className="min-w-0">
        <div className="text-white font-semibold">{title}</div>
        <div className="text-neutral-400 text-xs sm:text-sm">{subtitle}</div>
      </div>
    </div>
  </button>
);

export const Menu = () => {
  const router = useRouter();
  const { user, ready } = useFirebaseUser();
  const [games, setGames] = useState<RollWithMeGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    listGames()
      .then(setGames)
      .catch(() => setError('Failed to load games'))
      .finally(() => setIsLoading(false));
  }, [ready, user]);

  const handleCreate = async (type: GameType) => {
    if (!user || isCreating) return;
    const name = user.displayName || user.email || 'Player';
    setIsCreating(true);
    setError(null);
    try {
      const game = await createGame(type, name);
      router.push(`${ROLL_WITH_ME_ROUTE}/${game.id}`);
    } catch {
      setError('Failed to create game');
      setIsCreating(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('Delete this game?')) return;
    try {
      await deleteGame(gameId);
      setGames(prev => prev.filter(g => g.id !== gameId));
    } catch {
      setError('Failed to delete game');
    }
  };

  if (!ready) return null;
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-neutral-300">Sign in to play Roll With Me.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Roll With Me</h1>
      <p className="text-neutral-400 text-sm mb-6">A dice game for one or two.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <NewGameCard
          type="solo"
          title="Solo"
          subtitle="Practice on your own"
          illustration={<SoloIcon className="w-12 h-12" />}
          disabled={isCreating}
          onClick={() => handleCreate('solo')}
        />
        <NewGameCard
          type="versus"
          title="Versus"
          subtitle="Invite a friend to play"
          illustration={<VersusIcon className="w-14 h-12" />}
          disabled={isCreating}
          onClick={() => handleCreate('versus')}
        />
      </div>

      {error && (
        <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3 text-neutral-200">Your games</h2>
      {isLoading ? (
        <ul className="flex flex-col gap-2">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </ul>
      ) : games.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-2">
          {games.map(game => {
            const myScore = game.player1.uid === user.uid
              ? getTotal(game.player1.scores)
              : game.player2?.uid === user.uid
              ? getTotal(game.player2.scores)
              : 0;
            const isCreator = game.player1.uid === user.uid;
            const status = gameStatus(game, user.uid);
            return (
              <li
                key={game.id}
                className="group relative bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-brand-400 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => router.push(`${ROLL_WITH_ME_ROUTE}/${game.id}`)}
                  className="w-full text-left p-4 pr-12 cursor-pointer flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium truncate">{subtitle(game, user.uid)}</span>
                      <StatusPill variant={status.variant}>{status.label}</StatusPill>
                    </div>
                    <div className="text-sm text-neutral-400">Score: {myScore}</div>
                  </div>
                </button>
                {isCreator && (
                  <button
                    type="button"
                    onClick={() => handleDelete(game.id)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 p-2 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label="Delete game"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
