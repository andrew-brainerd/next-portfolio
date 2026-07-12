'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import {
  buzzBuzzedGame,
  completeBuzzedGame,
  getBuzzedGame,
  overturnBuzzedQuestion,
  resolveBuzzedQuestion,
  skipBuzzedQuestion
} from '@/api/buzzed';
import { getChannel } from '@/utils/pusher';
import { useServerClock } from '@/hooks/useServerClock';
import { isDisputable } from '@/utils/buzzed';
import {
  BUZZED_BUZZ_LOCKED,
  BUZZED_BUZZ_REOPENED,
  BUZZED_GAME_UPDATED,
  BUZZED_QUESTION_RESOLVED,
  buzzedChannelName
} from '@/constants/buzzed';
import { BuzzerButton } from '@/components/buzzed/BuzzerButton';
import { Scoreboard } from '@/components/buzzed/Scoreboard';
import type { BuzzedGame } from '@/types/buzzed';

interface GameActiveProps {
  initialGame: BuzzedGame;
  currentUserId: string;
}

export const GameActive = ({ initialGame, currentUserId }: GameActiveProps) => {
  const router = useRouter();
  const { serverNow } = useServerClock();
  const [game, setGame] = useState(initialGame);
  const [answer, setAnswer] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHost = game.ownerUserId === currentUserId;
  const question = game.currentQuestion;
  const iRangIn = question?.state === 'locked' && question.lockedBy === currentUserId;
  const ringer = game.players.find(p => p.userId === question?.lockedBy);
  const now = serverNow();

  const refetch = useCallback(async () => {
    const fresh = await getBuzzedGame(game.id);
    if (!fresh) return;
    // A finished game changes which view the route renders, so bounce it back through the server.
    if (fresh.status !== 'active') {
      router.refresh();
      return;
    }
    setGame(fresh);
  }, [game.id, router]);

  // Every hot event carries a payload, but they all mean "the game moved" — refetching keeps one source
  // of truth and sidesteps having to reconcile a partial payload against local state. The payload's job
  // is to let us react instantly where it matters (see the pause in Q-C); the refetch is the correctness net.
  useEffect(() => {
    const channel = getChannel(buzzedChannelName(initialGame.id));
    const events = [
      BUZZED_GAME_UPDATED,
      BUZZED_BUZZ_LOCKED,
      BUZZED_BUZZ_REOPENED,
      BUZZED_QUESTION_RESOLVED
    ];

    events.forEach(event => channel.bind(event, refetch));
    return () => {
      events.forEach(event => channel.unbind(event, refetch));
      channel.unsubscribe();
    };
  }, [initialGame.id, refetch]);

  const run = async (action: () => Promise<BuzzedGame | void>) => {
    setPending(true);
    setError(null);
    try {
      const fresh = await action();
      if (fresh) setGame(fresh);
    } catch {
      setError('That didn’t go through. Try again.');
    } finally {
      setPending(false);
    }
  };

  const onBuzz = async () => {
    if (!question) return;
    setPending(true);
    setError(null);
    try {
      // We act on THIS response, not on the Pusher event — the winner knows first, which is what makes
      // the pause exactly-once. Losing the race is a normal outcome, not an error.
      const { game: fresh } = await buzzBuzzedGame(game.id, question.index, game.playback.positionSec);
      setGame(fresh);
    } catch {
      setError('That didn’t go through. Try again.');
    } finally {
      setPending(false);
    }
  };

  const onResolve = (correct: boolean) =>
    run(async () => {
      const fresh = await resolveBuzzedQuestion(game.id, correct, answer.trim() || undefined);
      setAnswer('');
      return fresh;
    });

  const canDispute = isDisputable(game, currentUserId, now);
  const lastWinner = game.history[game.history.length - 1];
  const disputedName = game.players.find(p => p.userId === lastWinner?.resolvedBy)?.displayName;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-col items-center gap-6">
        {question?.state === 'locked' && !iRangIn && (
          <div className="w-full rounded-lg border border-brand-600/50 bg-brand-600/15 px-4 py-3 text-center">
            <p className="text-lg font-semibold text-white">{ringer?.displayName} rang in!</p>
            <p className="text-sm text-neutral-400">Waiting for their answer…</p>
          </div>
        )}

        {iRangIn ? (
          <div className="w-full max-w-sm rounded-lg border border-brand-600/50 bg-brand-600/15 p-4">
            <p className="mb-3 text-center text-lg font-semibold text-white">You rang in!</p>
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="What was it? (optional)"
              className="mb-3 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-brand-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <Button
                fullWidth
                variant="contained"
                color="success"
                disabled={pending}
                onClick={() => onResolve(true)}
              >
                Got it
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                disabled={pending}
                onClick={() => onResolve(false)}
              >
                Missed it
              </Button>
            </div>
          </div>
        ) : (
          <BuzzerButton
            game={game}
            currentUserId={currentUserId}
            now={now}
            pending={pending}
            onBuzz={onBuzz}
          />
        )}

        {canDispute && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => overturnBuzzedQuestion(game.id))}
            className="text-sm text-neutral-400 underline hover:text-white disabled:opacity-50"
          >
            {disputedName} didn’t get that — dispute it
          </button>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {isHost && (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="small"
              disabled={pending || !question}
              onClick={() => run(() => skipBuzzedQuestion(game.id))}
            >
              Nobody got it
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              disabled={pending}
              onClick={() => run(() => completeBuzzedGame(game.id))}
            >
              End game
            </Button>
          </div>
        )}
      </div>

      <Scoreboard game={game} currentUserId={currentUserId} />
    </div>
  );
};
