'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useRollWithMeStore } from '@/hooks/useRollWithMeStore';
import { getGame } from '@/api/rollWithMe';
import { getChannel } from '@/utils/pusher';
import { ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { playGameOver, playJoin } from '@/utils/rollWithMeSound';
import { getTotal } from '@/utils/rollWithMeScoring';
import { GameBoard } from './GameBoard';
import { GameOver } from './GameOver';
import { WaitingForOpponent } from './WaitingForOpponent';
import { InviteModal } from './InviteModal';
import { InviteIcon } from './icons/InviteIcon';

const GAME_UPDATED = 'gameUpdated';
const PLAYER_JOINED = 'playerJoined';
const GAME_OVER = 'gameOver';

interface GameProps {
  gameId: string;
}

const GameSkeleton = () => (
  <div className="md:container md:mx-auto md:max-w-5xl md:px-6 md:py-6 px-4 pt-4">
    <div className="flex gap-2 sm:gap-3 justify-center my-4">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-800 animate-pulse" />
      ))}
    </div>
    <div className="bg-neutral-900 border border-neutral-800 rounded-md p-4 max-w-md mx-auto space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-7 bg-neutral-800 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

const FADE = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.18 }
};

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

  const prevGameOverRef = useRef<boolean | null>(null);
  const prevHasPlayer2Ref = useRef<boolean | null>(null);

  useEffect(() => {
    if (!game) return;
    const prevGameOver = prevGameOverRef.current;
    prevGameOverRef.current = game.isGameOver;
    if (prevGameOver === false && game.isGameOver) {
      let isWinner = true;
      if (game.type === 'versus' && game.player2 && user) {
        const p1Total = getTotal(game.player1.scores);
        const p2Total = getTotal(game.player2.scores);
        if (p1Total !== p2Total) {
          const winner = p1Total > p2Total ? game.player1 : game.player2;
          isWinner = winner.uid === user.uid;
        } else {
          isWinner = false;
        }
      }
      playGameOver(isWinner ? 'win' : 'lose');
    }

    const prevHasPlayer2 = prevHasPlayer2Ref.current;
    const hasPlayer2 = !!game.player2;
    prevHasPlayer2Ref.current = hasPlayer2;
    if (prevHasPlayer2 === false && hasPlayer2) {
      playJoin();
    }
  }, [game, user]);

  if (!ready) return null;
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-neutral-300">Sign in to view this game.</p>
      </div>
    );
  }
  if (isLoading) return <GameSkeleton />;
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
  const view: 'gameover' | 'waiting' | 'board' = game.isGameOver
    ? 'gameover'
    : game.type === 'versus' && !game.player2
    ? 'waiting'
    : 'board';

  return (
    <>
      {view === 'board' && (
        <div className="container mx-auto px-4 pt-4 max-w-2xl flex justify-end">
          {game.type === 'versus' && isCreator && (
            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-brand-400 cursor-pointer px-2 py-1 rounded-md hover:bg-neutral-800/60 transition-colors"
              aria-label="Invite a player"
            >
              <InviteIcon className="w-4 h-4" />
              Invite
            </button>
          )}
        </div>
      )}
      <AnimatePresence mode="wait">
        {view === 'gameover' ? (
          <motion.div key="gameover" {...FADE}>
            <GameOver game={game} myUid={user.uid} />
          </motion.div>
        ) : view === 'waiting' ? (
          <motion.div key="waiting" {...FADE}>
            <WaitingForOpponent gameId={game.id} canInvite={isCreator} />
          </motion.div>
        ) : (
          <motion.div key="board" {...FADE}>
            <GameBoard game={game} myUid={user.uid} />
          </motion.div>
        )}
      </AnimatePresence>
      <InviteModal isOpen={isInviteOpen} gameId={game.id} closeModal={() => setIsInviteOpen(false)} />
    </>
  );
};
