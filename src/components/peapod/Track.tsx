'use client';

import type { Artist } from '@/types/peapod';

interface TrackProps {
  className?: string;
  artists?: Artist[];
  name?: string;
  onClick?: () => void;
}

const getPrimaryArtist = (artists: Artist[]) => (artists[0] || {}).name;

export default function Track({ className, name, artists, onClick }: TrackProps) {
  const artist = getPrimaryArtist(artists || []);

  return (
    <div
      className={`text-2xl py-3 text-left transition-all duration-300 select-none ${onClick ? 'cursor-pointer hover:pl-4' : ''} ${className || ''}`}
      onClick={onClick}
    >
      <span className="mr-2.5">{name}</span>
      <span className="text-xs opacity-70">{artist}</span>
    </div>
  );
}
