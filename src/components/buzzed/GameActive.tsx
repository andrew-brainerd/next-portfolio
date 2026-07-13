'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

import { completeBuzzedGame, gradeBuzzedRingIn, setBuzzedPlayback } from '@/api/buzzed';
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
  needsAdvance,
  pendingGrades
} from '@/utils/buzzed';
import { BUZZED_GRADED, BUZZED_RANG_IN, BUZZED_WINDOW_CLOSED } from '@/constants/buzzed';
import { buzzedResultsRoute } from '@/constants/routes';
import { BuzzerButton } from '@/components/buzzed/BuzzerButton';
import { GradePrompt } from '@/components/buzzed/GradePrompt';
import { HostVideo } from '@/components/buzzed/HostVideo';
import { RingInQueue } from '@/components/buzzed/RingInQueue';
import { RosterToggle } from '@/components/buzzed/RosterToggle';
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

  // A buzzer is the one screen you stare at without touching for minutes and then must react to in under
  // a second. A sleeping phone loses you the ring-in.
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
    // Act on the payload the instant it lands; the refetch behind it reconciles.
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

  // The answering window elapsed but nobody has closed it. Whichever client notices fires /advance —
  // it's idempotent server-side, so a race between clients is harmless. Guarded by a ref so a re-render
  // (this component re-renders every 200ms off the clock) can't spam it.
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

  const secondsLeft = answerSecondsLeft(game, now);
  const answering = question?.state === 'answering';
  const toGrade = pendingGrades(game, currentUserId);
  const showVideo = game.target === 'host' && isHost;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-w-0 flex-col items-center gap-4">
        {showVideo && <HostVideo game={game} now={now} onPlaybackChange={onPlaybackChange} />}

        {answering && (
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

        {question && question.ringIns.length > 0 && (
          <RingInQueue game={game} question={question} currentUserId={currentUserId} />
        )}

        {playing ? (
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

        {toGrade.map(pendingQuestion => (
          <GradePrompt
            key={pendingQuestion.index}
            question={pendingQuestion}
            pending={pending}
            onGrade={onGrade}
          />
        ))}

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

        <RosterToggle game={game} currentUserId={currentUserId} onChange={setGame} />
      </div>

      <Scoreboard game={game} currentUserId={currentUserId} />
    </div>
  );
};
