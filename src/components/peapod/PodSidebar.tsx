'use client';

import { useState } from 'react';
import PlayQueue from './PlayQueue';
import PlayHistory from './PlayHistory';
import SessionHistory from './SessionHistory';
import type { SpotifyTrack } from '@/types/peapod';

type SidebarTab = 'queue' | 'history' | 'sessions';

interface PodSidebarProps {
  podId: string;
  queue: SpotifyTrack[];
  history: SpotifyTrack[];
  favoriteTrackIds: Set<string>;
  onRemoveFromQueue: (track: SpotifyTrack) => void;
  onAddToQueue: (track: SpotifyTrack) => void;
  onToggleFavorite: (track: SpotifyTrack) => void;
}

export default function PodSidebar({
  podId,
  queue,
  history,
  favoriteTrackIds,
  onRemoveFromQueue,
  onAddToQueue,
  onToggleFavorite
}: PodSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('queue');

  const tabClass = (tab: SidebarTab) =>
    `bg-transparent border-none text-neutral-400 cursor-pointer flex-1 text-sm p-2.5 transition-colors duration-200 hover:text-white ${activeTab === tab ? 'border-b-2 border-b-brand-400 text-white' : ''}`;

  return (
    <div className="flex flex-col w-full">
      <div className="flex border-b border-neutral-700">
        <button className={tabClass('queue')} onClick={() => setActiveTab('queue')} type="button">
          Queue
        </button>
        <button className={tabClass('history')} onClick={() => setActiveTab('history')} type="button">
          History
        </button>
        <button className={tabClass('sessions')} onClick={() => setActiveTab('sessions')} type="button">
          Sessions
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'queue' && (
          <PlayQueue
            queue={queue}
            favoriteTrackIds={favoriteTrackIds}
            onRemove={onRemoveFromQueue}
            onToggleFavorite={onToggleFavorite}
          />
        )}
        {activeTab === 'history' && (
          <PlayHistory
            history={history}
            favoriteTrackIds={favoriteTrackIds}
            onAddToQueue={onAddToQueue}
            onToggleFavorite={onToggleFavorite}
          />
        )}
        {activeTab === 'sessions' && <SessionHistory podId={podId} />}
      </div>
    </div>
  );
}
