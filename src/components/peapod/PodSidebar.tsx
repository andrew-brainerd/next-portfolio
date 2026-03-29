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
  onStartPlaying: () => void;
}

export default function PodSidebar({ queue, history, isPodOwner, onStartPlaying }: PodSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('queue');

  return (
    <div className="border-l border-neutral-700 flex flex-col min-w-[280px] w-[35%] max-md:border-l-0 max-md:border-t max-md:border-neutral-700 max-md:min-w-0 max-md:w-full">
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
          <PlayQueue queue={queue} isPodOwner={isPodOwner} onStartPlaying={onStartPlaying} />
        ) : (
          <PlayHistory history={history} />
        )}
      </div>
    </div>
  );
}
