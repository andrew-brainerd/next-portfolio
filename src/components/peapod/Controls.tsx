'use client';

import type { SpotifyTrack, ControlsOptions } from '@/types/peapod';

interface ControlsProps {
  className?: string;
  isPlaying?: boolean;
  options?: ControlsOptions;
  selectedTrack?: SpotifyTrack | null;
  onPlay?: () => void;
  onPause?: () => void;
  onAddToQueue?: () => void;
}

export default function Controls({
  className,
  isPlaying,
  options,
  selectedTrack,
  onPlay,
  onPause,
  onAddToQueue
}: ControlsProps) {
  const { canPlay = true, canPause = true, canQueue } = options || {};

  return (
    <div className={`flex bg-neutral-700 rounded-2xl justify-center mx-auto w-52 ${className || ''}`}>
      {isPlaying
        ? canPause && (
            <button
              className="cursor-pointer text-white text-3xl m-2.5 transition-colors duration-300 hover:text-brand-400 bg-transparent border-none"
              onClick={onPause}
              type="button"
              aria-label="Pause"
            >
              ⏸
            </button>
          )
        : canPlay && (
            <button
              className="cursor-pointer text-white text-3xl m-2.5 transition-colors duration-300 hover:text-brand-400 bg-transparent border-none"
              onClick={onPlay}
              type="button"
              aria-label="Play"
            >
              ▶
            </button>
          )}
      {canQueue && !!selectedTrack && (
        <button
          className="cursor-pointer text-white text-3xl m-2.5 transition-colors duration-300 hover:text-brand-400 bg-transparent border-none"
          onClick={onAddToQueue}
          type="button"
          aria-label="Add to Queue"
          title="Add Track to Queue"
        >
          +
        </button>
      )}
    </div>
  );
}
