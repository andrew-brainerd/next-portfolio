'use client';

import TrackProgress from './TrackProgress';
import Loading from '@/components/Loading';
import type { NowPlaying } from '@/types/peapod';

interface ClientPlayerProps {
  isPlaying?: boolean;
  trackName?: string;
  nowPlaying?: NowPlaying;
  albumArt?: string;
}

export default function ClientPlayer({ isPlaying, trackName, nowPlaying, albumArt }: ClientPlayerProps) {
  return (
    <div className="bg-neutral-800 rounded-xl text-base mx-auto my-4 max-w-3xl overflow-hidden w-[95%]">
      {isPlaying ? (
        <div className="flex items-center text-2xl p-6 relative">
          <div className="flex-[3]">
            <div className="text-3xl mb-6">{trackName}</div>
            <TrackProgress nowPlaying={nowPlaying} />
          </div>
          <div className="flex-1">{albumArt && <img className="w-24" src={albumArt} alt="Album Art" />}</div>
        </div>
      ) : (
        <div className="flex items-center text-5xl h-36 justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
}
