'use client';

import { useReducer, useEffect } from 'react';
import { formatTimer } from '@/hooks/usePeapod';
import type { NowPlaying } from '@/types/peapod';

interface TrackProgressProps {
  nowPlaying?: NowPlaying;
  compact?: boolean;
}

type TimerState = { timerMs: number; trackId: number | undefined; syncedProgressMs: number };
type TimerAction =
  | { type: 'tick'; durationMs: number }
  | { type: 'sync'; progressMs: number; trackId: number | undefined };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'tick':
      return state.timerMs < action.durationMs ? { ...state, timerMs: state.timerMs + 1000 } : state;
    case 'sync': {
      const trackChanged = action.trackId !== state.trackId;
      const drifted = Math.abs(action.progressMs - state.timerMs) / 1000 > 5;
      if (trackChanged || drifted) {
        return { timerMs: action.progressMs, trackId: action.trackId, syncedProgressMs: action.progressMs };
      }
      return state;
    }
  }
}

export default function TrackProgress({ nowPlaying = {}, compact = false }: TrackProgressProps) {
  const progressMs = nowPlaying?.progress_ms || 0;
  const durationMs = nowPlaying?.item?.duration_ms || 0;
  const trackId = nowPlaying?.id;
  const isPlaying = nowPlaying?.is_playing ?? false;

  const [state, dispatch] = useReducer(timerReducer, {
    timerMs: progressMs,
    trackId,
    syncedProgressMs: progressMs
  });

  // Sync when server progress or track changes
  useEffect(() => {
    dispatch({ type: 'sync', progressMs, trackId });
  }, [progressMs, trackId]);

  // Tick every second while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      dispatch({ type: 'tick', durationMs });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, durationMs]);

  const percent = durationMs > 0 ? Math.min((state.timerMs / durationMs) * 100, 100) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="h-1 flex-1 bg-neutral-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-400 rounded-full transition-[width] duration-1000 ease-linear"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-xs text-neutral-400 tabular-nums whitespace-nowrap">
          {formatTimer(state.timerMs)} / {formatTimer(durationMs)}
        </div>
      </div>
    );
  }

  return (
    <div className="my-2.5">
      <div className="h-1 w-full bg-neutral-600 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-brand-400 rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center gap-1 text-sm tabular-nums">
        <span>{formatTimer(state.timerMs)}</span>
        <span>/</span>
        <span>{formatTimer(durationMs)}</span>
      </div>
    </div>
  );
}
