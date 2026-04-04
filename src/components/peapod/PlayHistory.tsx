'use client';

import type { SpotifyTrack } from '@/types/peapod';
import Track from './Track';

interface PlayHistoryProps {
  history: SpotifyTrack[];
}

export default function PlayHistory({ history }: PlayHistoryProps) {
  return (
    <div className="m-5 overflow-y-auto">
      <div>
        {[...new Map([...history].reverse().map(t => [t.uri, t])).values()].map((track: SpotifyTrack, i: number) => (
          <Track
            key={i}
            className="bg-neutral-800 rounded-md mx-auto my-2.5 p-4"
            name={track.name}
            artists={track.artists}
            albumArt={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
          />
        ))}
      </div>
    </div>
  );
}
