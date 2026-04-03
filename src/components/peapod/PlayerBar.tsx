'use client';

import TrackProgress from './TrackProgress';
import type { NowPlaying } from '@/types/peapod';

interface PlayerBarProps {
  nowPlaying?: NowPlaying;
  isPodOwner: boolean;
  isFavorited?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onToggleFavorite?: () => void;
}

export default function PlayerBar({
  nowPlaying,
  isPodOwner,
  isFavorited,
  onPlay,
  onPause,
  onNext,
  onToggleFavorite
}: PlayerBarProps) {
  const isPlaying = nowPlaying?.is_playing;
  const trackName = nowPlaying?.item?.name;
  const artistName = nowPlaying?.item?.artists?.map(a => a.name).join(', ');
  const albumArt = nowPlaying?.item?.album?.images?.[2]?.url || nowPlaying?.item?.album?.images?.[1]?.url;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-700 z-40">
      <div className="mx-auto max-w-5xl flex items-center gap-4 px-5 py-3">
        {/* Album art */}
        <div className="w-12 h-12 rounded bg-neutral-700 flex-shrink-0 overflow-hidden">
          {albumArt ? (
            <img className="w-full h-full object-cover" src={albumArt} alt="Album Art" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{trackName || 'No track playing'}</div>
          {artistName && <div className="text-xs text-neutral-400 truncate">{artistName}</div>}
          {trackName && <TrackProgress nowPlaying={nowPlaying} compact />}
        </div>

        {/* Favorite */}
        {trackName && (
          <button
            className={`transition-colors cursor-pointer flex-shrink-0 ${isFavorited ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'}`}
            onClick={onToggleFavorite}
            type="button"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Controls (owner only) */}
        {isPodOwner && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className="text-white hover:text-brand-400 transition-colors cursor-pointer"
              onClick={isPlaying ? onPause : onPlay}
              type="button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
            <button
              className="text-white hover:text-brand-400 transition-colors cursor-pointer"
              onClick={onNext}
              type="button"
              aria-label="Next track"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="4,4 15,12 4,20" />
                <rect x="17" y="4" width="3" height="16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
