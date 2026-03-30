'use client';

import { useReducer, useEffect } from 'react';
import { formatTimer } from '@/hooks/usePeapod';
import type { NowPlaying } from '@/types/peapod';

interface TrackProgressProps {
  nowPlaying?: NowPlaying;
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

export default function TrackProgress({ nowPlaying = {} }: TrackProgressProps) {
  const progressMs = nowPlaying?.progress_ms || 0;
  const durationMs = nowPlaying?.item?.duration_ms || 0;
  const trackId = nowPlaying?.id;

  const [state, dispatch] = useReducer(timerReducer, {
    timerMs: progressMs,
    trackId,
    syncedProgressMs: progressMs
  });

  // Sync when server progress or track changes
  useEffect(() => {
    dispatch({ type: 'sync', progressMs, trackId });
  }, [progressMs, trackId]);

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'tick', durationMs });
    }, 1000);
    return () => clearInterval(interval);
  }, [durationMs]);

  return (
    <div className="flex flex-row my-2.5">
      <div className="text-sm mx-1 my-0.5 text-center">{formatTimer(state.timerMs)}</div>/
      <div className="text-sm mx-1 my-0.5 text-center">{formatTimer(durationMs)}</div>
    </div>
  );
}
