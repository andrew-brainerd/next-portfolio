'use client';

import { useState } from 'react';
import PlayQueue from './PlayQueue';
import PlayHistory from './PlayHistory';
import type { SpotifyTrack } from '@/types/peapod';

type SidebarTab = 'queue' | 'history';

interface PodSidebarProps {
  queue: SpotifyTrack[];
  history: SpotifyTrack[];
  isPodOwner: boolean;
  favoriteTrackIds: Set<string>;
  onStartPlaying: () => void;
  onRemoveFromQueue: (track: SpotifyTrack) => void;
  onAddToQueue: (track: SpotifyTrack) => void;
  onToggleFavorite: (track: SpotifyTrack) => void;
}

export default function PodSidebar({
  queue,
  history,
  isPodOwner,
  favoriteTrackIds,
  onStartPlaying,
  onRemoveFromQueue,
  onAddToQueue,
  onToggleFavorite
}: PodSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('queue');

  return (
    <div className="flex flex-col w-full">
      <div className="flex border-b border-neutral-700">
        <button
          className={`bg-transparent border-none text-neutral-400 cursor-pointer flex-1 text-sm p-2.5 transition-colors duration-200 hover:text-white ${activeTab === 'queue' ? 'border-b-2 border-b-brand-400 text-white' : ''}`}
          onClick={() => setActiveTab('queue')}
          type="button"
        >
          Queue
        </button>
        <button
          className={`bg-transparent border-none text-neutral-400 cursor-pointer flex-1 text-sm p-2.5 transition-colors duration-200 hover:text-white ${activeTab === 'history' ? 'border-b-2 border-b-brand-400 text-white' : ''}`}
          onClick={() => setActiveTab('history')}
          type="button"
        >
          History
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'queue' ? (
          <PlayQueue
            queue={queue}
            isPodOwner={isPodOwner}
            onStartPlaying={onStartPlaying}
            onRemove={onRemoveFromQueue}
          />
        ) : (
          <PlayHistory
            history={history}
            favoriteTrackIds={favoriteTrackIds}
            onAddToQueue={onAddToQueue}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </div>
    </div>
  );
}
