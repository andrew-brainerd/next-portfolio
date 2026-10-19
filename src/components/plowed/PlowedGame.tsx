'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getPlowedScores, submitPlowedScore } from '@/api/plowedClient';
import type { PlowedDirection, PlowedHud, PlowedScoreEntry, PlowedSprites, PlowedState } from '@/types/plowed';
import {
  COMBO_GRACE_MS,
  createGame,
  fitPixelWidth,
  multiplierFor,
  queueDirection,
  startGame,
  step,
  togglePause
} from '@/utils/plowed';
import { LEADERBOARD_SIZE, ordinal, qualifiesForLeaderboard } from '@/utils/plowedLeaderboard';
import { PlowedInitialsEntry } from './PlowedInitialsEntry';
import { PlowedLeaderboard } from './PlowedLeaderboard';
import { TILE, loadPlowedSprites, renderPlowed } from './renderPlowed';

const STEP_MS = 1000 / 120;
const MAX_FRAME_MS = 250;
const SWIPE_MIN_PX = 24;
const BEST_KEY = 'plowed:best';

const KEY_DIRECTIONS: Record<string, PlowedDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right'
};

const readBest = () => {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeBest = (score: number) => {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Storage unavailable (private mode); best score just won't persist.
  }
};

const hudFrom = (state: PlowedState): PlowedHud => ({
  phase: state.phase,
  score: state.score,
  multiplier: multiplierFor(state.streak),
  lives: state.lives,
  level: state.level,
  shielded: state.shieldMs > 0,
  piles: state.piles
});

const sameHud = (a: PlowedHud, b: PlowedHud) =>
  a.phase === b.phase &&
  a.score === b.score &&
  a.multiplier === b.multiplier &&
  a.lives === b.lives &&
  a.level === b.level &&
  a.shielded === b.shielded &&
  a.piles === b.piles;

export const PlowedGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const comboBarRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<PlowedState | null>(null);
  const facingRef = useRef<PlowedDirection>('down');
  const hudRef = useRef<PlowedHud | null>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const [hud, setHud] = useState<PlowedHud | null>(null);
  const [best, setBest] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [displayWidth, setDisplayWidth] = useState<number | null>(null);
  const [scores, setScores] = useState<PlowedScoreEntry[] | null>(null);
  const [scoresFailed, setScoresFailed] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [skipped, setSkipped] = useState(false);

  const loadScores = useCallback(() => {
    getPlowedScores(LEADERBOARD_SIZE)
      .then(loaded => {
        setScores(loaded);
        setScoresFailed(false);
      })
      .catch(() => setScoresFailed(true));
  }, []);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const start = useCallback(() => {
    const state = stateRef.current;
    if (!state || (state.phase !== 'title' && state.phase !== 'gameOver')) return;
    setRank(null);
    setSkipped(false);
    startGame(state);
  }, []);

  const submitScore = useCallback(
    async (initials: string) => {
      const state = stateRef.current;
      if (!state) return;
      const result = await submitPlowedScore({
        initials,
        score: state.score,
        level: state.level,
        piles: state.piles,
        durationMs: Math.round(state.elapsedMs)
      });
      setRank(result.rank);
      loadScores();
    },
    [loadScores]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = createGame();
    stateRef.current = state;
    canvas.width = state.map.width * TILE;
    canvas.height = state.map.height * TILE;
    ctx.imageSmoothingEnabled = false;
    setSize({ width: canvas.width, height: canvas.height });
    setBest(readBest());

    let frame = 0;
    let cancelled = false;
    let last = performance.now();
    let accumulator = 0;

    let sprites: PlowedSprites;
    const tick = (now: number) => {
      accumulator += Math.min(MAX_FRAME_MS, now - last);
      last = now;
      while (accumulator >= STEP_MS) {
        step(state, STEP_MS);
        accumulator -= STEP_MS;
        if (state.events.includes('gameOver') && state.score > readBest()) {
          writeBest(state.score);
          setBest(state.score);
        }
      }
      if (state.player.dir) facingRef.current = state.player.dir;

      renderPlowed(ctx, state, sprites, facingRef.current, now);
      if (comboBarRef.current) {
        const fraction = state.streak > 0 ? state.comboMs / COMBO_GRACE_MS : 0;
        comboBarRef.current.style.transform = `scaleX(${fraction})`;
      }

      const next = hudFrom(state);
      if (!hudRef.current || !sameHud(hudRef.current, next)) {
        hudRef.current = next;
        setHud(next);
      }
      frame = requestAnimationFrame(tick);
    };
    loadPlowedSprites().then(loaded => {
      if (cancelled) return;
      sprites = loaded;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !size.width) return;
    const fit = () => {
      const top = container.getBoundingClientRect().top + window.scrollY;
      const availableHeight = window.innerHeight - top - 16;
      const available = Math.min(container.clientWidth, (availableHeight * size.width) / size.height);
      setDisplayWidth(fitPixelWidth(available, size.width, window.devicePixelRatio || 1));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    window.addEventListener('resize', fit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [size]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const state = stateRef.current;
      if (!state || event.target instanceof HTMLInputElement) return;
      const dir = KEY_DIRECTIONS[event.key] ?? KEY_DIRECTIONS[event.key.toLowerCase()];
      if (dir) {
        event.preventDefault();
        queueDirection(state, dir);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (state.phase === 'paused') togglePause(state);
        else start();
        return;
      }
      if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
        togglePause(state);
      }
    };

    const pauseIfActive = () => {
      const state = stateRef.current;
      if (state && (state.phase === 'playing' || state.phase === 'ready')) togglePause(state);
    };
    const onVisibility = () => {
      if (document.hidden) pauseIfActive();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', pauseIfActive);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', pauseIfActive);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [start]);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    swipeRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchMove = (event: React.TouchEvent) => {
    const origin = swipeRef.current;
    const state = stateRef.current;
    if (!origin || !state) return;
    const touch = event.touches[0];
    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return;
    if (Math.abs(dx) > Math.abs(dy)) queueDirection(state, dx > 0 ? 'right' : 'left');
    else queueDirection(state, dy > 0 ? 'down' : 'up');
    swipeRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const phase = hud?.phase ?? 'title';
  const finalScore = hud?.score ?? 0;
  const enteringInitials =
    phase === 'gameOver' && rank === null && !skipped && !!scores && qualifiesForLeaderboard(scores, finalScore);

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-4 select-none">
      <div
        className="mx-auto flex w-full items-end justify-between font-mono text-sm text-neutral-200"
        style={{ maxWidth: displayWidth ?? undefined }}
      >
        <div>
          <div className="text-xs uppercase tracking-widest text-neutral-400">Score</div>
          <div className="text-2xl font-bold tabular-nums text-white">{(hud?.score ?? 0).toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-neutral-400">Multiplier</div>
          <div className={`text-2xl font-bold tabular-nums ${hud?.shielded ? 'text-amber-300' : 'text-sky-300'}`}>
            {hud?.multiplier ?? 1}×{hud?.shielded && <span className="ml-1 text-sm">🍺</span>}
          </div>
          <div className="mx-auto mt-1 h-1 w-20 overflow-hidden rounded-full bg-neutral-700">
            <div
              ref={comboBarRef}
              className={`h-full w-full origin-left ${hud?.shielded ? 'bg-amber-300' : 'bg-sky-300'}`}
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-neutral-400">
            Lvl {hud?.level ?? 1} · Best {Math.max(best, 0).toLocaleString()}
          </div>
          <div className="text-xl tracking-widest text-red-400" aria-label={`${hud?.lives ?? 0} lives`}>
            {'♥'.repeat(Math.max(0, hud?.lives ?? 0))}
          </div>
        </div>
      </div>

      <div ref={containerRef} className="w-full">
        <div
          className="relative mx-auto touch-none"
          style={{
            width: displayWidth ?? '100%',
            aspectRatio: size.width && size.height ? `${size.width} / ${size.height}` : undefined
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => (swipeRef.current = null)}
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full rounded-md border border-neutral-700 [image-rendering:pixelated]"
          />

          {phase !== 'playing' && (
            <div
              className={`absolute inset-0 flex items-center justify-center overflow-y-auto rounded-md p-6 text-center ${
                phase === 'ready' || phase === 'levelClear' ? 'pointer-events-none' : 'bg-black/55'
              }`}
            >
              {phase === 'title' && (
                <div className="flex max-w-sm flex-col items-center gap-3">
                  <h1 className="font-mono text-5xl font-black tracking-widest text-white">PLOWED</h1>
                  <p className="text-sm text-neutral-200">
                    Shovel every pile in the neighborhood. Keep shoveling to build up to an 8× multiplier, but go too long
                    without a fresh pile and you lose it.
                  </p>
                  <p className="text-sm text-neutral-300">
                    <span className="text-amber-300">Cheese curds</span> lure the Yeti into a cage.{' '}
                    <span className="text-amber-300">Beer</span> freezes the multiplier timer for a bit.
                  </p>
                  <button
                    type="button"
                    onClick={start}
                    className="mt-2 rounded bg-sky-500 px-6 py-2 font-mono font-bold text-white hover:bg-sky-400"
                  >
                    Start
                  </button>
                  <p className="text-xs text-neutral-400">Arrows / WASD or swipe · P to pause</p>
                  <PlowedLeaderboard scores={scores} failed={scoresFailed} />
                </div>
              )}
              {phase === 'ready' && <p className="font-mono text-3xl font-bold text-amber-300">READY!</p>}
              {phase === 'paused' && (
                <button
                  type="button"
                  onClick={() => stateRef.current && togglePause(stateRef.current)}
                  className="font-mono text-3xl font-bold text-white"
                >
                  PAUSED
                  <span className="block text-sm font-normal text-neutral-300">Tap or press P to resume</span>
                </button>
              )}
              {phase === 'levelClear' && (
                <p className="font-mono text-3xl font-bold text-sky-300">Level {hud?.level} plowed!</p>
              )}
              {phase === 'gameOver' && (
                <div className="flex flex-col items-center gap-2">
                  <p className="font-mono text-4xl font-black text-red-400">GAME OVER</p>
                  <p className="font-mono text-white">
                    {(hud?.score ?? 0).toLocaleString()} pts · level {hud?.level} · {hud?.piles} piles
                  </p>
                  <p className="text-sm text-neutral-300">Best {best.toLocaleString()}</p>
                  {enteringInitials ? (
                    <PlowedInitialsEntry onSubmit={submitScore} onSkip={() => setSkipped(true)} />
                  ) : (
                    <>
                      {rank !== null && (
                        <p className="font-mono text-amber-300">You placed {ordinal(rank)} on the leaderboard!</p>
                      )}
                      <button
                        type="button"
                        onClick={start}
                        className="mt-2 rounded bg-sky-500 px-6 py-2 font-mono font-bold text-white hover:bg-sky-400"
                      >
                        Shovel again
                      </button>
                      <PlowedLeaderboard scores={scores} failed={scoresFailed} highlightRank={rank} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
