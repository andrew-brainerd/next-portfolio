'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import { addToPlayQueue, addFavorite } from '@/api/peapod';
import { searchSpotify, play } from '@/api/spotify-client';
import type { SpotifyTrack } from '@/types/peapod';
import Track from './Track';
import Modal from './Modal';

interface SearchArtist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface SearchAlbum {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
}

interface TrackListProps {
  searchText?: string;
  podId: string;
  userId?: string;
  onArtistSelect?: (artistId: string) => void;
  onAlbumSelect?: (albumId: string) => void;
  onAddToQueue?: (track: SpotifyTrack) => void;
  onPlayTrack?: (track: SpotifyTrack) => void;
  onActionComplete?: () => void;
}

export default function TrackList({
  searchText = '',
  podId,
  userId,
  onArtistSelect,
  onAlbumSelect,
  onAddToQueue,
  onPlayTrack,
  onActionComplete
}: TrackListProps) {
  const accessToken = useSpotifyAuth(s => s.accessToken);
  type SearchResult =
    | { type: 'artist'; data: SearchArtist; score: number }
    | { type: 'album'; data: SearchAlbum; score: number }
    | { type: 'track'; data: SpotifyTrack; score: number };

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  const scoreMatch = (name: string, query: string, index: number): number => {
    const lower = name.toLowerCase();
    const q = query.toLowerCase();
    if (lower === q) return 100 - index;
    if (lower.startsWith(q)) return 80 - index;
    if (lower.includes(q)) return 60 - index;
    return 40 - index;
  };

  const doSearch = useCallback(async () => {
    if (!searchText || !accessToken) return;
    setIsLoading(true);
    try {
      const data = await searchSpotify(searchText);
      const artists: SearchResult[] = (data?.artists?.items || []).slice(0, 5).map((a: SearchArtist, i: number) => ({
        type: 'artist' as const,
        data: a,
        score: scoreMatch(a.name, searchText, i)
      }));
      const albums: SearchResult[] = (data?.albums?.items || []).slice(0, 5).map((a: SearchAlbum, i: number) => ({
        type: 'album' as const,
        data: a,
        score: scoreMatch(a.name, searchText, i)
      }));
      const tracks: SearchResult[] = (
        [...new Map((data?.tracks?.items || []).map((t: SpotifyTrack) => [t.name, t])).values()] as SpotifyTrack[]
      )
        .slice(0, 10)
        .map((t: SpotifyTrack, i: number) => ({
          type: 'track' as const,
          data: t,
          score: scoreMatch(t.name, searchText, i)
        }));
      setResults([...artists, ...albums, ...tracks].sort((a, b) => b.score - a.score));
    } catch {
      setResults([]);
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
    if (onAddToQueue) {
      onAddToQueue(selectedTrack);
    } else {
      await addToPlayQueue(podId, selectedTrack);
    }
    setSelectedTrack(null);
    onActionComplete?.();
  };

  const handleAddToFavorites = async () => {
    if (!selectedTrack || !userId) return;
    await addFavorite(podId, selectedTrack, userId);
    setSelectedTrack(null);
    onActionComplete?.();
  };

  const handlePlayNext = async () => {
    if (!selectedTrack) return;
    if (onPlayTrack) {
      onPlayTrack(selectedTrack);
    } else {
      await play({ uris: [selectedTrack.uri] });
    }
    setSelectedTrack(null);
    onActionComplete?.();
  };

  const handleGoToArtist = () => {
    const artistId = selectedTrack?.artists?.[0]?.id;
    if (artistId && onArtistSelect) {
      onArtistSelect(artistId);
    }
    setSelectedTrack(null);
    onActionComplete?.();
  };

  const handleGoToAlbum = () => {
    const albumId = selectedTrack?.album?.id;
    if (albumId && onAlbumSelect) {
      onAlbumSelect(albumId);
    }
    setSelectedTrack(null);
    onActionComplete?.();
  };

  if (isLoading || !accessToken) {
    return <div className="text-sm py-4 text-center text-neutral-400">Loading...</div>;
  }

  if (results.length === 0) return null;

  const actions = [
    {
      label: 'Add to Queue',
      onClick: handleAddToQueue,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      )
    },
    {
      label: 'Add to Favorites',
      onClick: handleAddToFavorites,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    },
    {
      label: 'Play Now',
      onClick: handlePlayNext,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      )
    },
    {
      label: 'Go to Artist',
      onClick: handleGoToArtist,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    },
    {
      label: 'Go to Album',
      onClick: handleGoToAlbum,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-full py-1">
      {results.map((result, i) => {
        if (result.type === 'artist') {
          const artist = result.data;
          return (
            <button
              key={`artist-${artist.id}`}
              onClick={() => {
                onArtistSelect?.(artist.id);
                onActionComplete?.();
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-neutral-700 transition-colors cursor-pointer"
              type="button"
            >
              {artist.images?.[2]?.url ? (
                <img className="w-10 h-10 rounded-full flex-shrink-0 object-cover" src={artist.images[2].url} alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full flex-shrink-0 bg-neutral-700 flex items-center justify-center text-neutral-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{artist.name}</div>
                <div className="text-xs text-neutral-500">Artist</div>
              </div>
            </button>
          );
        }

        if (result.type === 'album') {
          const album = result.data;
          return (
            <button
              key={`album-${album.id}`}
              onClick={() => {
                onAlbumSelect?.(album.id);
                onActionComplete?.();
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-neutral-700 transition-colors cursor-pointer"
              type="button"
            >
              {album.images?.[2]?.url ? (
                <img className="w-10 h-10 rounded flex-shrink-0 object-cover" src={album.images[2].url} alt="" />
              ) : (
                <div className="w-10 h-10 rounded flex-shrink-0 bg-neutral-700 flex items-center justify-center text-neutral-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{album.name}</div>
                <div className="text-xs text-neutral-400 truncate">
                  {album.artists?.map(a => a.name).join(', ')} <span className="text-neutral-500">· Album</span>
                </div>
              </div>
            </button>
          );
        }

        const track = result.data;
        return (
          <Track
            key={`track-${track.uri || i}`}
            onClick={() => setSelectedTrack(track)}
            name={track.name}
            artists={track.artists}
            albumArt={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
            className={selectedTrack?.uri === track.uri ? '!bg-neutral-600' : ''}
          />
        );
      })}

      <Modal isOpen={!!selectedTrack} onClose={() => setSelectedTrack(null)}>
        <div className="bg-neutral-800 rounded-xl overflow-hidden max-w-sm w-[90%]">
          {selectedTrack && (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-neutral-700">
                {selectedTrack.album?.images?.[2]?.url && (
                  <img
                    className="w-12 h-12 rounded flex-shrink-0 object-cover"
                    src={selectedTrack.album.images[2].url}
                    alt=""
                  />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{selectedTrack.name}</div>
                  <div className="text-xs text-neutral-400 truncate">
                    {selectedTrack.artists?.map(a => a.name).join(', ')}
                  </div>
                </div>
              </div>
              <div className="py-1">
                {actions.map(action => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="text-neutral-400">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
