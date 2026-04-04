'use client';

import type { SpotifyTrack } from '@/types/peapod';
import { deduplicateHistory, getAlbumArtUrl } from '@/utils/peapod';
import Track from './Track';

interface PlayHistoryProps {
  history: SpotifyTrack[];
  favoriteTrackIds: Set<string>;
  onAddToQueue: (track: SpotifyTrack) => void;
  onToggleFavorite: (track: SpotifyTrack) => void;
}

export default function PlayHistory({ history, favoriteTrackIds, onAddToQueue, onToggleFavorite }: PlayHistoryProps) {
  return (
    <div className="m-5 overflow-y-auto">
      <div>
        {deduplicateHistory(history).map((track: SpotifyTrack, i: number) => (
          <div key={i} className="group flex items-center bg-neutral-800 rounded-md mx-auto my-2.5">
            <div className="flex-1 min-w-0 p-4">
              <Track name={track.name} artists={track.artists} albumArt={getAlbumArtUrl(track)} />
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
              <button
                onClick={() => onAddToQueue(track)}
                className="text-neutral-400 hover:text-brand-400 transition-colors cursor-pointer p-1"
                type="button"
                aria-label="Add to queue"
                title="Add to Queue"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button
                onClick={() => onToggleFavorite(track)}
                className={`transition-colors cursor-pointer p-1 ${favoriteTrackIds.has(track.uri) ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'}`}
                type="button"
                aria-label={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to favorites'}
                title={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to Favorites'}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={favoriteTrackIds.has(track.uri) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
