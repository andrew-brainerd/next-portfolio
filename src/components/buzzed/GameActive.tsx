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
  setBuzzedPlayback
} from '@/api/buzzed';
import { getChannel, leaveChannel } from '@/utils/pusher';
import { useServerClock } from '@/hooks/useServerClock';
import { isDisputable, isOnRoster } from '@/utils/buzzed';
import {
  BUZZED_BUZZ_LOCKED,
  BUZZED_BUZZ_REOPENED,
  BUZZED_GAME_UPDATED,
  BUZZED_QUESTION_RESOLVED,
  buzzedChannelName
} from '@/constants/buzzed';
import { BuzzerButton } from '@/components/buzzed/BuzzerButton';
import { HostVideo } from '@/components/buzzed/HostVideo';
import { RosterToggle } from '@/components/buzzed/RosterToggle';
import { Scoreboard } from '@/components/buzzed/Scoreboard';
import { SpectatorPanel } from '@/components/buzzed/SpectatorPanel';
import type { BuzzedGame } from '@/types/buzzed';

interface GameActiveProps {
  initialGame: BuzzedGame;
  currentUserId: string;
}

export const GameActive = ({ initialGame, currentUserId }: GameActiveProps) => {
  const router = useRouter();
  const { serverNow } = useServerClock();
  const [game, setGame] = useState(initialGame);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHost = game.ownerUserId === currentUserId;
  const playing = isOnRoster(game, currentUserId);
  const question = game.currentQuestion;
  const iRangIn = question?.state === 'locked' && question.lockedBy === currentUserId;
  const ringer = game.players.find(p => p.userId === question?.lockedBy);
  const now = serverNow();

  const refetch = useCallback(async () => {
    const fresh = await getBuzzedGame(game.id);
    if (!fresh) return;
    if (fresh.status !== 'active') {
      router.refresh();
      return;
    }
    setGame(fresh);
  }, [game.id, router]);

  useEffect(() => {
    const name = buzzedChannelName(initialGame.id);
    const channel = getChannel(name);
    const events = [
      BUZZED_GAME_UPDATED,
      BUZZED_BUZZ_LOCKED,
      BUZZED_BUZZ_REOPENED,
      BUZZED_QUESTION_RESOLVED
    ];

    events.forEach(event => channel.bind(event, refetch));
    return () => {
      events.forEach(event => channel.unbind(event, refetch));
      leaveChannel(name);
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
      const { game: fresh } = await buzzBuzzedGame(game.id, question.index);
      setGame(fresh);
    } catch {
      setError('That didn’t go through. Try again.');
    } finally {
      setPending(false);
    }
  };

  // Deliberately does NOT setGame from the response. The player fires this asynchronously (a pause on a
  // ring-in), so it can be in flight while another player resolves — and its response, computed before that
  // resolve landed, would clobber the fresh scores the Pusher refetch just wrote. The server fans out; the
  // refetch is the only thing allowed to publish game state that this client did not itself just cause.
  const onPlaybackChange = useCallback(
    (isPlaying: boolean, positionSec: number) => {
      void setBuzzedPlayback(game.id, isPlaying, positionSec);
    },
    [game.id]
  );

  const onResolve = (correct: boolean) => run(() => resolveBuzzedQuestion(game.id, correct));

  const canDispute = isDisputable(game, currentUserId, now);
  const lastWinner = game.history[game.history.length - 1];
  const disputedName = game.players.find(p => p.userId === lastWinner?.resolvedBy)?.displayName;

  const showVideo = game.target === 'host' && isHost;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-col items-center gap-6">
        {showVideo && <HostVideo game={game} now={now} onPlaybackChange={onPlaybackChange} />}

        {question?.state === 'locked' && !iRangIn && (
          <div className="w-full rounded-lg border border-brand-600/50 bg-brand-600/15 px-4 py-3 text-center">
            <p className="text-lg font-semibold text-white">{ringer?.displayName} rang in!</p>
            <p className="text-sm text-neutral-400">Waiting for their answer…</p>
          </div>
        )}

        {iRangIn ? (
          <div className="w-full max-w-sm rounded-lg border border-brand-600/50 bg-brand-600/15 p-6">
            <p className="text-center text-lg font-semibold text-white">You rang in!</p>
            <p className="mb-4 text-center text-sm text-neutral-400">Say it out loud — were you right?</p>
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
        ) : playing ? (
          <BuzzerButton
            game={game}
            currentUserId={currentUserId}
            now={now}
            pending={pending}
            onBuzz={onBuzz}
          />
        ) : (
          <SpectatorPanel game={game} now={now} isHost={isHost} />
        )}

        {!playing && isHost && question?.state === 'locked' && (
          <div className="flex gap-2">
            <Button
              variant="contained"
              color="success"
              disabled={pending}
              onClick={() => onResolve(true)}
            >
              They got it
            </Button>
            <Button variant="outlined" color="error" disabled={pending} onClick={() => onResolve(false)}>
              They missed
            </Button>
          </div>
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
          <Button
            variant="outlined"
            size="small"
            color="error"
            disabled={pending}
            onClick={() => run(() => completeBuzzedGame(game.id))}
          >
            End game
          </Button>
        )}

        {!iRangIn && <RosterToggle game={game} currentUserId={currentUserId} onChange={setGame} />}
      </div>

      <Scoreboard game={game} currentUserId={currentUserId} />
    </div>
  );
};
