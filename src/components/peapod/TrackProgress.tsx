'use client';

import { useState, useEffect, useRef } from 'react';
import { formatTimer } from '@/hooks/usePeapod';
import type { NowPlaying } from '@/types/peapod';

interface TrackProgressProps {
  nowPlaying?: NowPlaying;
}

export default function TrackProgress({ nowPlaying = {} }: TrackProgressProps) {
  const progressMs = nowPlaying?.progress_ms || 0;
  const durationMs = nowPlaying?.item?.duration_ms || 0;
  const [timerMs, setTimerMs] = useState(progressMs);
  const prevTrackId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const syncDiff = Math.abs(progressMs - timerMs) / 1000;
    if (nowPlaying.id !== prevTrackId.current || syncDiff > 5) {
      setTimerMs(progressMs);
    }
    prevTrackId.current = nowPlaying.id;
  }, [nowPlaying.id, progressMs, timerMs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerMs(prev => (prev < durationMs ? prev + 1000 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [durationMs]);

  return (
    <div className="flex flex-row my-2.5">
      <div className="text-sm mx-1 my-0.5 text-center">{formatTimer(timerMs)}</div>/
      <div className="text-sm mx-1 my-0.5 text-center">{formatTimer(durationMs)}</div>
    </div>
  );
}
