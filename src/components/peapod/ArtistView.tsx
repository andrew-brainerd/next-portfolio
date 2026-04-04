'use client';

import { useState, useEffect } from 'react';
import { getArtistDetails } from '@/api/spotify-client';
import { addToPlayQueue, addFavorite } from '@/api/peapod';
import type { SpotifyTrack, SpotifyAlbum } from '@/types/peapod';
import Track from './Track';
import { BackIcon, PlusIcon, HeartIcon } from './icons';

interface ArtistData {
  artist: { id: string; name: string; images: { url: string }[]; genres: string[] };
  topTracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
}

interface ArtistViewProps {
  artistId: string;
  podId: string;
  userId?: string;
  favoriteTrackIds: Set<string>;
  onBack: () => void;
  onAlbumSelect: (albumId: string) => void;
  onAddToQueue?: (track: SpotifyTrack) => void;
}

export default function ArtistView({
  artistId,
  podId,
  userId,
  favoriteTrackIds,
  onBack,
  onAlbumSelect,
  onAddToQueue
}: ArtistViewProps) {
  const [data, setData] = useState<ArtistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      getArtistDetails(artistId)
        .then(setData)
        .finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timeout);
  }, [artistId]);

  if (isLoading) {
    return <div className="text-neutral-400 text-center py-8">Loading artist...</div>;
  }

  if (!data) {
    return <div className="text-neutral-400 text-center py-8">Artist not found</div>;
  }

  const { artist, topTracks, albums } = data;
  const artistImage = artist.images?.[1]?.url || artist.images?.[0]?.url;

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
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          type="button"
          aria-label="Back"
        >
          <BackIcon size="w-5 h-5" />
        </button>
        {artistImage && <img className="w-12 h-12 rounded-full object-cover" src={artistImage} alt="" />}
        <div>
          <div className="text-lg font-bold">{artist.name}</div>
          {artist.genres?.length > 0 && (
            <div className="text-xs text-neutral-400">{artist.genres.slice(0, 3).join(', ')}</div>
          )}
        </div>
      </div>

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-neutral-300 mb-2 px-1">Top Tracks</div>
          {topTracks.map((track, i) => (
            <div key={track.uri || i} className="group flex items-center">
              <div className="flex-1 min-w-0">
                <Track
                  name={track.name}
                  artists={track.artists}
                  albumArt={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                />
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
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-neutral-300 mb-2 px-1">Albums</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-1">
            {albums.map(album => (
              <button
                key={album.id || album.name}
                onClick={() => album.id && onAlbumSelect(album.id)}
                className="bg-neutral-800 hover:bg-neutral-700 rounded-lg p-3 transition-colors cursor-pointer text-left"
                type="button"
              >
                {album.images?.[1]?.url && (
                  <img className="w-full aspect-square rounded object-cover mb-2" src={album.images[1].url} alt="" />
                )}
                <div className="text-xs font-medium truncate">{album.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
