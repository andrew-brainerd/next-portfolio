'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import {
  completeBuzzedGame,
  gradeBuzzedRingIn,
  pauseBuzzedGame,
  resumeBuzzedGame,
  setBuzzedPlayback
} from '@/api/buzzed';
import { advanceNow, buzzNow } from '@/api/buzzedClient';
import { useBuzzedGameSync } from '@/hooks/useBuzzedGameSync';
import { useServerClock } from '@/hooks/useServerClock';
import { useWakeLock } from '@/hooks/useWakeLock';
import {
  applyGraded,
  applyRangIn,
  applyWindowClosed,
  answerSecondsLeft,
  isOnRoster,
  isPaused,
  needsAdvance,
  pendingGrade
} from '@/utils/buzzed';
import { BUZZED_GRADED, BUZZED_RANG_IN, BUZZED_WINDOW_CLOSED } from '@/constants/buzzed';
import { buzzedResultsRoute } from '@/constants/routes';
import { BuzzerButton } from '@/components/buzzed/BuzzerButton';
import { GradePrompt } from '@/components/buzzed/GradePrompt';
import { HostVideo } from '@/components/buzzed/HostVideo';
import { GameMenu } from '@/components/buzzed/GameMenu';
import { PausedPanel } from '@/components/buzzed/PausedPanel';
import { RingInQueue } from '@/components/buzzed/RingInQueue';
import { Scoreboard } from '@/components/buzzed/Scoreboard';
import { SpectatorPanel } from '@/components/buzzed/SpectatorPanel';
import type {
  BuzzedGame,
  BuzzedGrade,
  GradedPayload,
  RangInPayload,
  WindowClosedPayload
} from '@/types/buzzed';

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

  useWakeLock(game.status === 'active');

  const isHost = game.ownerUserId === currentUserId;
  const playing = isOnRoster(game, currentUserId);
  const question = game.currentQuestion;
  const now = serverNow();

  useBuzzedGameSync(
    initialGame.id,
    fresh => {
      if (fresh.status === 'completed') {
        router.replace(buzzedResultsRoute(fresh.id));
        return;
      }
      if (fresh.status !== 'active') {
        router.refresh();
        return;
      }
      setGame(fresh);
    },
    (event, payload) => {
      if (event === BUZZED_RANG_IN) {
        setGame(g => applyRangIn(g, payload as RangInPayload));
      } else if (event === BUZZED_WINDOW_CLOSED) {
        setGame(g => applyWindowClosed(g, payload as WindowClosedPayload));
      } else if (event === BUZZED_GRADED) {
        setGame(g => applyGraded(g, payload as GradedPayload));
      }
    }
  );

  // /advance is idempotent, so racing clients are harmless. The ref stops the 200ms clock re-render
  // from spamming it.
  const advancingRef = useRef<number | null>(null);
  useEffect(() => {
    if (!needsAdvance(game, now)) return;

    const index = game.currentQuestion?.index ?? -1;
    if (advancingRef.current === index) return;
    advancingRef.current = index;

    void advanceNow(game.id)
      .then(setGame)
      .catch(() => undefined);
  }, [game, now]);

  const onPlaybackChange = useCallback(
    (isPlaying: boolean, positionSec: number) => {
      void setBuzzedPlayback(game.id, isPlaying, positionSec);
    },
    [game.id]
  );

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
      const { game: fresh } = await buzzNow(game.id, question.index);
      setGame(fresh);
    } catch {
      setError('That didn’t go through. Try again.');
    } finally {
      setPending(false);
    }
  };

  const onGrade = (questionIndex: number, grade: BuzzedGrade) =>
    run(() => gradeBuzzedRingIn(game.id, questionIndex, grade));

  // Pause before completing: unmounting the player doesn't stop a Roku, so the TV would keep playing.
  const onEndGame = () =>
    run(async () => {
      await setBuzzedPlayback(game.id, false, game.playback.positionSec);
      return completeBuzzedGame(game.id);
    });

  const onPause = () => run(() => pauseBuzzedGame(game.id));
  const onResume = () => run(() => resumeBuzzedGame(game.id));

  const secondsLeft = answerSecondsLeft(game, now);
  const answering = question?.state === 'answering';
  const paused = isPaused(game);
  const toGrade = pendingGrade(game, currentUserId);
  const showVideo = game.target === 'host' && isHost;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-2xl font-bold text-white sm:text-3xl">{game.name}</h1>
        <GameMenu game={game} currentUserId={currentUserId} onChange={setGame} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col items-center gap-4">
          {/* Kept mounted through a pause — unmounting would lose the playhead. */}
          {showVideo && <HostVideo game={game} now={now} onPlaybackChange={onPlaybackChange} />}

          {paused && <PausedPanel isHost={isHost} pending={pending} onResume={onResume} />}

          {!paused && answering && (
            <div className="w-full min-w-0 rounded-lg border border-brand-600/50 bg-brand-600/15 px-3 py-3 text-center">
              <p className="text-3xl font-bold tabular-nums text-white">{secondsLeft}</p>
              <p className="text-sm text-neutral-400">Answer now — anyone else can still ring in</p>

              {isHost && (
                <Button
                  variant="outlined"
                  size="small"
                  className="mt-2"
                  disabled={pending}
                  onClick={() => run(() => advanceNow(game.id))}
                >
                  Resume now
                </Button>
              )}
            </div>
          )}

          {!paused && question && question.ringIns.length > 0 && (
            <RingInQueue game={game} question={question} currentUserId={currentUserId} />
          )}

          {!paused &&
            (playing ? (
              <BuzzerButton
                game={game}
                currentUserId={currentUserId}
                now={now}
                pending={pending}
                onBuzz={onBuzz}
              />
            ) : (
              <SpectatorPanel game={game} now={now} isHost={isHost} />
            ))}

          {!paused && toGrade && (
            <GradePrompt question={toGrade} pending={pending} onGrade={onGrade} />
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          {isHost && !paused && (
            <div className="flex gap-2">
              <Button variant="outlined" size="small" disabled={pending} onClick={onPause}>
                Pause game
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                disabled={pending}
                onClick={onEndGame}
              >
                End game
              </Button>
            </div>
          )}
        </div>

        <Scoreboard game={game} currentUserId={currentUserId} />
      </div>
    </>
  );
};
