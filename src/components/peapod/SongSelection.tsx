'use client';

import { useState, useRef, useEffect } from 'react';
import SearchBar from './SearchBar';
import TrackList from './TrackList';

interface SongSelectionProps {
  podId: string;
  userId?: string;
  onArtistSelect?: (artistId: string) => void;
  onAlbumSelect?: (albumId: string) => void;
}

export default function SongSelection({ podId, userId, onArtistSelect, onAlbumSelect }: SongSelectionProps) {
  const [searchText, setSearchText] = useState('');
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <SearchBar
        searchText={searchText}
        onSearchTextChange={text => {
          setSearchText(text);
          setIsResultsOpen(!!text);
        }}
      />
      {isResultsOpen && searchText && (
        <div className="bg-neutral-900 border border-neutral-600 rounded-md left-0 max-h-96 overflow-y-auto absolute right-0 top-full z-10">
          <TrackList
            searchText={searchText}
            podId={podId}
            userId={userId}
            onArtistSelect={onArtistSelect}
            onAlbumSelect={onAlbumSelect}
            onActionComplete={() => {
              setIsResultsOpen(false);
              setSearchText('');
            }}
          />
        </div>
      )}
    </div>
  );
}
