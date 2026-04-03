'use client';

import TrackProgress from './TrackProgress';
import Controls from './Controls';
import type { NowPlaying } from '@/types/peapod';

interface OwnerPlayerProps {
  isPlaying?: boolean;
  trackName?: string;
  nowPlaying?: NowPlaying;
  albumArt?: string;
  onPlay: () => void;
  onPause: () => void;
}

export default function OwnerPlayer({ isPlaying, trackName, nowPlaying, albumArt, onPlay, onPause }: OwnerPlayerProps) {
  return (
    <div className="bg-neutral-800 rounded-xl text-base mx-auto my-4 max-w-3xl overflow-hidden w-[95%]">
      {isPlaying ? (
        <div className="flex items-center border-b-4 border-brand-500 text-2xl p-6 relative">
          <div className="flex-[3]">
            <div className="text-3xl mb-6">{trackName}</div>
            <TrackProgress nowPlaying={nowPlaying} />
          </div>
          <Controls className="!bg-transparent" isPlaying={isPlaying} onPlay={onPlay} onPause={onPause} />
          <div className="flex-1">{albumArt && <img className="w-24" src={albumArt} alt="Album Art" />}</div>
        </div>
      ) : (
        <div className="flex items-center border-b-4 border-brand-500 text-5xl h-36 justify-center">
          <Controls isPlaying={isPlaying} onPlay={onPlay} onPause={onPause} />
        </div>
      )}
    </div>
  );
}
