'use client';

import TrackProgress from './TrackProgress';
import Controls from './Controls';
import Devices from './Devices';
import PodMembers from './PodMembers';
import type { NowPlaying, SpotifyDevice, PodMember } from '@/types/peapod';

interface OwnerPlayerProps {
  isPlaying?: boolean;
  trackName?: string;
  nowPlaying?: NowPlaying;
  albumArt?: string;
  devices: SpotifyDevice[];
  members: PodMember[];
  activeMembers: string[];
  podCreatorId?: string;
  currentUserId?: string;
  spotifyToken: string;
  onPlay: () => void;
  onPause: () => void;
  onTransferPlayback: (deviceId: string) => void;
}

export default function OwnerPlayer({
  isPlaying,
  trackName,
  nowPlaying,
  albumArt,
  devices,
  members,
  activeMembers,
  podCreatorId,
  currentUserId,
  onPlay,
  onPause,
  onTransferPlayback
}: OwnerPlayerProps) {
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
      <div className="flex justify-evenly">
        <Devices devices={devices} onTransferPlayback={onTransferPlayback} />
        <PodMembers
          members={members}
          activeMembers={activeMembers}
          podCreatorId={podCreatorId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
