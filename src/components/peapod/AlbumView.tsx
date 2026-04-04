'use client';

import { useState, useEffect } from 'react';
import { getAlbumDetails } from '@/api/spotifyClient';
import { addToPlayQueue, addFavorite } from '@/api/peapod';
import type { SpotifyTrack } from '@/types/peapod';
import Track from './Track';
import { BackIcon, PlusIcon, HeartIcon } from './Icons';

interface AlbumData {
  album: { id: string; name: string; artists: { name: string }[]; images: { url: string }[]; release_date: string };
  tracks: SpotifyTrack[];
}

interface AlbumViewProps {
  albumId: string;
  podId: string;
  userId?: string;
  favoriteTrackIds: Set<string>;
  onBack: () => void;
  onAddToQueue?: (track: SpotifyTrack) => void;
}

export default function AlbumView({ albumId, podId, userId, favoriteTrackIds, onBack, onAddToQueue }: AlbumViewProps) {
  const [data, setData] = useState<AlbumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      getAlbumDetails(albumId)
        .then(setData)
        .finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timeout);
  }, [albumId]);

  if (isLoading) {
    return <div className="text-neutral-400 text-center py-8">Loading album...</div>;
  }

  if (!data) {
    return <div className="text-neutral-400 text-center py-8">Album not found</div>;
  }

  const { album, tracks } = data;
  const albumImage = album.images?.[1]?.url || album.images?.[0]?.url;
  const artistNames = album.artists?.map(a => a.name).join(', ');
  const year = album.release_date?.split('-')[0];

  const handleAddToQueue = async (track: SpotifyTrack) => {
    if (onAddToQueue) {
      onAddToQueue(track);
    } else {
      await addToPlayQueue(podId, track);
    }
  };

  const handleAddToFavorites = async (track: SpotifyTrack) => {
    if (!userId) return;
    await addFavorite(podId, track, userId);
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          type="button"
          aria-label="Back"
        >
          <BackIcon size="w-5 h-5" />
        </button>
        {albumImage && <img className="w-14 h-14 rounded object-cover" src={albumImage} alt="" />}
        <div className="min-w-0">
          <div className="text-lg font-bold truncate">{album.name}</div>
          <div className="text-xs text-neutral-400 truncate">
            {artistNames}
            {year && ` \u00B7 ${year}`}
          </div>
        </div>
      </div>

      {/* Tracks */}
      {tracks.map((track, i) => (
        <div key={track.uri || i} className="group flex items-center">
          <div className="text-xs text-neutral-500 w-8 text-right pr-3 flex-shrink-0">{i + 1}</div>
          <div className="flex-1 min-w-0">
            <Track name={track.name} artists={track.artists} />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
            <button
              onClick={() => handleAddToQueue(track)}
              className="text-neutral-400 hover:text-brand-400 transition-colors cursor-pointer p-2"
              type="button"
              aria-label="Add to queue"
              title="Add to Queue"
            >
              <PlusIcon />
            </button>
            <button
              onClick={() => handleAddToFavorites(track)}
              className={`transition-colors cursor-pointer p-2 ${favoriteTrackIds.has(track.uri) ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'}`}
              type="button"
              aria-label={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to favorites'}
              title={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to Favorites'}
            >
              <HeartIcon fill={favoriteTrackIds.has(track.uri) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
