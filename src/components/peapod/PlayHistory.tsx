'use client';

import type { SpotifyTrack } from '@/types/peapod';
import { deduplicateHistory, getAlbumArtUrl } from '@/utils/peapod';
import Track from './Track';
import { HeartIcon, PlusIcon } from './icons';

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
                className="text-neutral-400 hover:text-brand-400 transition-colors cursor-pointer p-2"
                type="button"
                aria-label="Add to queue"
                title="Add to Queue"
              >
                <PlusIcon />
              </button>
              <button
                onClick={() => onToggleFavorite(track)}
                className={`transition-colors cursor-pointer p-2 ${favoriteTrackIds.has(track.uri) ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'}`}
                type="button"
                aria-label={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to favorites'}
                title={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to Favorites'}
              >
                <HeartIcon fill={favoriteTrackIds.has(track.uri) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
