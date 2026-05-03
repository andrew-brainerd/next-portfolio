'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useRollWithMeStore } from '@/hooks/useRollWithMeStore';
import { getGame } from '@/api/rollWithMe';
import { getChannel } from '@/utils/pusher';
import { ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { GameBoard } from './GameBoard';
import { GameOver } from './GameOver';
import { WaitingForOpponent } from './WaitingForOpponent';
import { InviteModal } from './InviteModal';

const GAME_UPDATED = 'gameUpdated';
const PLAYER_JOINED = 'playerJoined';
const GAME_OVER = 'gameOver';

interface GameProps {
  gameId: string;
}

export const Game = ({ gameId }: GameProps) => {
  const router = useRouter();
  const { user, ready } = useFirebaseUser();
  const game = useRollWithMeStore(s => s.game);
  const setGame = useRollWithMeStore(s => s.setGame);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    getGame(gameId)
      .then(g => {
        if (!g) {
          setError('Game not found');
          return;
        }
        setGame(g);
      })
      .catch(() => setError('Failed to load game'))
      .finally(() => setIsLoading(false));

    return () => setGame(null);
  }, [gameId, ready, user, setGame]);

  useEffect(() => {
    if (!ready || !user) return;
    const channel = getChannel(gameId);
    const refetch = async () => {
      const g = await getGame(gameId);
      if (g) setGame(g);
    };
    channel.bind(GAME_UPDATED, refetch);
    channel.bind(PLAYER_JOINED, refetch);
    channel.bind(GAME_OVER, refetch);
    return () => {
      channel.unbind(GAME_UPDATED, refetch);
      channel.unbind(PLAYER_JOINED, refetch);
      channel.unbind(GAME_OVER, refetch);
      channel.unsubscribe();
    };
  }, [gameId, ready, user, setGame]);

  if (!ready) return null;
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-neutral-300">Sign in to view this game.</p>
      </div>
    );
  }
  if (isLoading) return <div className="container mx-auto p-6 text-neutral-400">Loading…</div>;
  if (error || !game) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-400 mb-4">{error || 'Game not found'}</p>
        <button
          type="button"
          onClick={() => router.push(ROLL_WITH_ME_ROUTE)}
          className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-md cursor-pointer"
        >
          Back to menu
        </button>
      </div>
    );
  }

  const isCreator = game.player1.uid === user.uid;

  if (game.isGameOver) {
    return <GameOver game={game} myUid={user.uid} />;
  }

  if (game.type === 'versus' && !game.player2) {
    return <WaitingForOpponent gameId={game.id} canInvite={isCreator} />;
  }

  return (
    <>
      <div className="container mx-auto px-4 pt-4 max-w-2xl flex justify-end">
        {game.type === 'versus' && isCreator && !game.isGameOver && (
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="text-xs text-neutral-400 hover:text-brand-400 cursor-pointer"
          >
            Invite
          </button>
        )}
      </div>
      <GameBoard game={game} myUid={user.uid} />
      <InviteModal isOpen={isInviteOpen} gameId={game.id} closeModal={() => setIsInviteOpen(false)} />
    </>
  );
};
