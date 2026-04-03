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
    <div className={`flex bg-neutral-700 rounded-2xl justify-center items-center mx-auto w-52 ${className || ''}`}>
      {isPlaying
        ? canPause && (
            <button
              className="cursor-pointer text-white m-2.5 transition-colors duration-300 hover:text-brand-400 bg-transparent border-none"
              onClick={onPause}
              type="button"
              aria-label="Pause"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          )
        : canPlay && (
            <button
              className="cursor-pointer text-white m-2.5 transition-colors duration-300 hover:text-brand-400 bg-transparent border-none"
              onClick={onPlay}
              type="button"
              aria-label="Play"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
          )}
      {canQueue && !!selectedTrack && (
        <button
          className="cursor-pointer text-white m-2.5 transition-colors duration-300 hover:text-brand-400 bg-transparent border-none"
          onClick={onAddToQueue}
          type="button"
          aria-label="Add to Queue"
          title="Add Track to Queue"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
