'use client';

import type { Artist } from '@/types/peapod';

interface TrackProps {
  className?: string;
  artists?: Artist[];
  name?: string;
  albumArt?: string;
  onClick?: () => void;
}

const getPrimaryArtist = (artists: Artist[]) => (artists[0] || {}).name;

export default function Track({ className, name, artists, albumArt, onClick }: TrackProps) {
  const artist = getPrimaryArtist(artists || []);

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 text-left transition-all duration-150 select-none ${onClick ? 'cursor-pointer hover:bg-neutral-700' : ''} ${className || ''}`}
      onClick={onClick}
    >
      {albumArt && <img className="w-10 h-10 rounded flex-shrink-0 object-cover" src={albumArt} alt="" />}
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        {artist && <div className="text-xs text-neutral-400 truncate">{artist}</div>}
      </div>
    </div>
  );
}
