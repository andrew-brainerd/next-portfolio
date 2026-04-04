'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import { addToPlayQueue } from '@/api/peapod';
import { searchSpotify } from '@/api/spotify-client';
import type { SpotifyTrack } from '@/types/peapod';
import Track from './Track';
import Controls from './Controls';
import Modal from './Modal';

interface TrackListProps {
  searchText?: string;
  podId: string;
}

export default function TrackList({ searchText = '', podId }: TrackListProps) {
  const accessToken = useSpotifyAuth(s => s.accessToken);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  const doSearch = useCallback(async () => {
    if (!searchText || !accessToken) return;
    setIsLoading(true);
    try {
      const data = await searchSpotify(searchText);
      setTracks(data?.tracks?.items || []);
    } catch {
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchText, accessToken]);

  useEffect(() => {
    const timeout = setTimeout(doSearch, 500);
    return () => clearTimeout(timeout);
  }, [doSearch]);

  const handleAddToQueue = async () => {
    if (!selectedTrack) return;
    await addToPlayQueue(podId, selectedTrack);
    setSelectedTrack(null);
  };

  if (isLoading || !accessToken) {
    return <div className="text-2xl mt-8 text-center">Loading Tracks...</div>;
  }

  return (
    <div className="mx-auto my-4 max-w-2xl overflow-y-auto w-[95%]">
      {tracks.length > 0 && (
        <div className="m-2.5 overflow-y-auto">
          {[...new Map(tracks.map(t => [t.name, t])).values()].map((track, i) => (
            <Track
              key={i}
              onClick={() => setSelectedTrack(track)}
              name={track.name}
              artists={track.artists}
              className={selectedTrack?.uri === track.uri ? 'bg-neutral-700 rounded-md px-3' : ''}
            />
          ))}
        </div>
      )}
      <Modal isOpen={!!selectedTrack} onClose={() => setSelectedTrack(null)}>
        <div className="bg-neutral-800 rounded-xl p-6 max-w-md w-[90%]">
          <div className="text-brand-400 text-xl mx-auto mb-5 overflow-hidden text-center text-ellipsis whitespace-nowrap">
            {selectedTrack?.name}
          </div>
          <Controls
            className="!flex !justify-center"
            isPlaying={false}
            selectedTrack={selectedTrack}
            options={{ canQueue: true, canPlay: false, canPause: false }}
            onAddToQueue={handleAddToQueue}
          />
        </div>
      </Modal>
    </div>
  );
}
