'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { listGames, createGame, deleteGame } from '@/api/rollWithMe';
import { ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { isMyTurn, getOpponent } from '@/hooks/useRollWithMeStore';
import { getTotal } from '@/utils/rollWithMeScoring';
import type { GameType, RollWithMeGame } from '@/types/rollWithMe';

const statusLabel = (game: RollWithMeGame, uid: string | undefined): string => {
  if (game.isGameOver) return 'Game Over';
  if (game.type === 'versus' && !game.player2) return 'Waiting for player 2';
  if (isMyTurn(game, uid)) return 'Your turn';
  return "Opponent's turn";
};

const subtitle = (game: RollWithMeGame, uid: string | undefined): string => {
  if (game.type === 'solo') return 'Solo';
  const opponent = getOpponent(game, uid);
  if (!opponent) return 'Versus';
  return `Versus ${opponent.name}`;
};

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
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Roll With Me</h1>

      <div className="flex gap-3 mb-8">
        <button
          type="button"
          onClick={() => handleCreate('solo')}
          disabled={isCreating}
          className="bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white px-5 py-2.5 rounded-md cursor-pointer"
        >
          New Solo Game
        </button>
        <button
          type="button"
          onClick={() => handleCreate('versus')}
          disabled={isCreating}
          className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-md cursor-pointer"
        >
          New VS Game
        </button>
      </div>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <h2 className="text-xl font-semibold mb-3">Your games</h2>
      {isLoading ? (
        <div className="text-neutral-400">Loading…</div>
      ) : games.length === 0 ? (
        <div className="text-neutral-400">No games yet — start one above.</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {games.map(game => {
            const myScore = game.player1.uid === user.uid ? getTotal(game.player1.scores)
              : game.player2?.uid === user.uid ? getTotal(game.player2.scores)
              : 0;
            const isCreator = game.player1.uid === user.uid;
            return (
              <li
                key={game.id}
                className="bg-neutral-800 border border-neutral-700 rounded-md p-4 flex items-center justify-between hover:border-brand-400 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => router.push(`${ROLL_WITH_ME_ROUTE}/${game.id}`)}
                  className="text-left flex-1 cursor-pointer"
                >
                  <div className="text-white font-medium">{subtitle(game, user.uid)}</div>
                  <div className="text-sm text-neutral-400">
                    {statusLabel(game, user.uid)} · Score: {myScore}
                  </div>
                </button>
                {isCreator && (
                  <button
                    type="button"
                    onClick={() => handleDelete(game.id)}
                    className="ml-4 text-neutral-500 hover:text-red-400 text-sm cursor-pointer"
                    aria-label="Delete game"
                  >
                    Delete
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
