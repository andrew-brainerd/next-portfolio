'use client';

import type { SpotifyTrack } from '@/types/peapod';
import { getAlbumArtUrl } from '@/utils/peapod';
import Track from './Track';
import { CloseIcon } from './icons';

interface PlayQueueProps {
  queue: SpotifyTrack[];
  isPodOwner: boolean;
  onStartPlaying: () => void;
  onRemove: (track: SpotifyTrack) => void;
}

export default function PlayQueue({ queue, isPodOwner, onStartPlaying, onRemove }: PlayQueueProps) {
  return (
    <div className="m-5 overflow-y-auto">
      {isPodOwner && (
        <button
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded transition-colors ml-2.5 mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onStartPlaying}
          disabled={!queue.length}
          type="button"
        >
          Launch Pod
        </button>
      )}
      <div>
        {[...queue].map((track: SpotifyTrack, i: number) => (
          <div key={i} className="group flex items-center bg-neutral-800 rounded-md mx-auto my-2.5">
            <div className="flex-1 min-w-0 p-4">
              <Track name={track.name} artists={track.artists} albumArt={getAlbumArtUrl(track)} />
            </div>
            <button
              onClick={() => onRemove(track)}
              className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 pr-4"
              type="button"
              aria-label="Remove from queue"
            >
              <CloseIcon size="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
