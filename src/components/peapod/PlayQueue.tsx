'use client';

import type { SpotifyTrack } from '@/types/peapod';
import Track from './Track';

interface PlayQueueProps {
  queue: SpotifyTrack[];
  isPodOwner: boolean;
  onStartPlaying: () => void;
}

export default function PlayQueue({ queue, isPodOwner, onStartPlaying }: PlayQueueProps) {
  return (
    <div className="m-5 overflow-y-auto">
      {isPodOwner && (
        <button
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded transition-colors ml-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onStartPlaying}
          disabled={!queue.length}
          type="button"
        >
          Start Playing Queue
        </button>
      )}
      <div>
        {[...queue].reverse().map((track: SpotifyTrack, i: number) => (
          <Track
            key={i}
            className="bg-neutral-800 rounded-md mx-auto my-2.5 p-4"
            name={track.name}
            artists={track.artists}
          />
        ))}
      </div>
    </div>
  );
}
