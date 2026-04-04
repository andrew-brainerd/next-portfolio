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
  onActionComplete?: () => void;
}

export default function TrackList({
  searchText = '',
  podId,
  userId,
  onArtistSelect,
  onAlbumSelect,
  onActionComplete
}: TrackListProps) {
  const accessToken = useSpotifyAuth(s => s.accessToken);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [artists, setArtists] = useState<SearchArtist[]>([]);
  const [albums, setAlbums] = useState<SearchAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  const doSearch = useCallback(async () => {
    if (!searchText || !accessToken) return;
    setIsLoading(true);
    try {
      const data = await searchSpotify(searchText);
      setTracks(data?.tracks?.items || []);
      setArtists(data?.artists?.items?.slice(0, 3) || []);
      setAlbums(data?.albums?.items?.slice(0, 3) || []);
    } catch {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
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
    await play({ uris: [selectedTrack.uri] });
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

  const hasResults = tracks.length > 0 || artists.length > 0 || albums.length > 0;

  if (!hasResults) return null;

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
    <div className="w-full">
      {/* Artists */}
      {artists.length > 0 && (
        <div className="py-1">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Artists</div>
          {artists.map(artist => (
            <button
              key={artist.id}
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
              <div className="text-sm font-medium">{artist.name}</div>
            </button>
          ))}
        </div>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <div className="py-1">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Albums</div>
          {albums.map(album => (
            <button
              key={album.id}
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
                <div className="text-xs text-neutral-400 truncate">{album.artists?.map(a => a.name).join(', ')}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Tracks */}
      {tracks.length > 0 && (
        <div className="py-1">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-2">Tracks</div>
          {[...new Map(tracks.map(t => [t.name, t])).values()].map((track, i) => (
            <Track
              key={i}
              onClick={() => setSelectedTrack(track)}
              name={track.name}
              artists={track.artists}
              albumArt={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
              className={selectedTrack?.uri === track.uri ? '!bg-neutral-600' : ''}
            />
          ))}
        </div>
      )}

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
