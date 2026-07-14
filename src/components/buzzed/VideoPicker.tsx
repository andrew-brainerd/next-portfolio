'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';

import {
  getYoutubeConnection,
  getYoutubePlaylists,
  getYoutubePlaylistItems,
  searchYoutubeVideos
} from '@/api/youtube';
import { parseYouTubeVideoId, youTubeWatchUrl } from '@/utils/buzzed';
import { VideoLinkInput } from '@/components/buzzed/VideoLinkInput';
import { VideoResultList } from '@/components/buzzed/VideoResultList';
import type { YoutubePlaylist, YoutubePlaylistItem } from '@/types/watch';

interface VideoPickerProps {
  // Picking from a playlist or a search result writes the video's URL here too, so there's one source of truth.
  value: string;
  onChange: (value: string) => void;
  returnPath: string;
  id?: string;
}

type Mode = 'link' | 'playlist' | 'search';

const MODE_LABELS: Record<Mode, string> = {
  link: 'Paste a link',
  playlist: 'Playlist',
  search: 'Search'
};

export const VideoPicker = ({ value, onChange, returnPath, id }: VideoPickerProps) => {
  const [mode, setMode] = useState<Mode>('link');
  const [connected, setConnected] = useState<boolean | null>(null);

  const [playlists, setPlaylists] = useState<YoutubePlaylist[]>([]);
  const [playlistId, setPlaylistId] = useState('');
  const [items, setItems] = useState<YoutubePlaylistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YoutubePlaylistItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  // The in-flight guard has to be a ref: the observer can fire again before a `searching` state update
  // has rendered, which would fetch the same page twice.
  const fetchingRef = useRef(false);

  const selectedVideoId = parseYouTubeVideoId(value);

  useEffect(() => {
    void getYoutubeConnection()
      .then(setConnected)
      .catch(() => setConnected(false));
  }, []);

  const loadPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      setPlaylists(await getYoutubePlaylists());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'playlist' && connected) void loadPlaylists();
  }, [mode, connected, loadPlaylists]);

  const onPickPlaylist = async (nextId: string) => {
    setPlaylistId(nextId);
    setItems([]);
    if (!nextId) return;

    setLoading(true);
    try {
      setItems(await getYoutubePlaylistItems(nextId));
    } finally {
      setLoading(false);
    }
  };

  // Only ever on an explicit submit: search.list costs 100 quota units a call against a 10k/day pool,
  // so a search-as-you-type would exhaust the day in minutes.
  const onSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || fetchingRef.current) return;

    fetchingRef.current = true;
    setSearching(true);
    setSearched(true);
    try {
      const page = await searchYoutubeVideos(trimmed);
      setResults(page.items);
      setNextPageToken(page.nextPageToken);
    } finally {
      fetchingRef.current = false;
      setSearching(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!nextPageToken || fetchingRef.current) return;

    fetchingRef.current = true;
    setSearching(true);
    try {
      const page = await searchYoutubeVideos(query.trim(), nextPageToken);
      setResults(current => [...current, ...page.items]);
      setNextPageToken(page.nextPageToken);
    } finally {
      fetchingRef.current = false;
      setSearching(false);
    }
  }, [nextPageToken, query]);

  const onPick = (videoId: string) => onChange(youTubeWatchUrl(videoId));

  const connectHref = `${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/watch/youtube/auth?from=${encodeURIComponent(returnPath)}`;

  const needsConnection = (mode === 'playlist' || mode === 'search') && connected === false;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(Object.keys(MODE_LABELS) as Mode[]).map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`flex-1 rounded-md border px-3 py-1.5 text-sm ${
              mode === option
                ? 'border-brand-500 bg-brand-600/20 text-white'
                : 'border-neutral-700 text-neutral-400 hover:text-white'
            }`}
          >
            {MODE_LABELS[option]}
          </button>
        ))}
      </div>

      {mode === 'link' && <VideoLinkInput value={value} onChange={onChange} id={id} />}

      {needsConnection && (
        <div className="rounded-md border border-neutral-800 bg-neutral-900/60 p-4 text-center">
          <p className="text-sm text-neutral-300">Connect YouTube to browse or search.</p>
          <p className="mt-1 text-xs text-neutral-500">Read-only.</p>
          <Button variant="contained" size="small" className="mt-3" href={connectHref}>
            Connect YouTube
          </Button>
        </div>
      )}

      {mode === 'playlist' && connected && (
        <div className="space-y-3">
          <select
            value={playlistId}
            onChange={e => void onPickPlaylist(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-base text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="">Choose a playlist…</option>
            {playlists.map(playlist => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.title} ({playlist.itemCount})
              </option>
            ))}
          </select>

          {loading && <p className="text-sm text-neutral-500">Loading…</p>}

          {!loading && playlistId && items.length === 0 && (
            <p className="text-sm text-neutral-500">That playlist is empty.</p>
          )}

          {items.length > 0 && (
            <VideoResultList items={items} selectedVideoId={selectedVideoId} onPick={onPick} />
          )}
        </div>
      )}

      {mode === 'search' && connected && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void onSearch();
                }
              }}
              placeholder="anime opening quiz"
              className="min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-base text-white placeholder:text-neutral-600 focus:border-brand-500 focus:outline-none"
            />
            <Button variant="outlined" disabled={!query.trim() || searching} onClick={() => void onSearch()}>
              Search
            </Button>
          </div>

          {searched && !searching && results.length === 0 && (
            <p className="text-sm text-neutral-500">Nothing found.</p>
          )}

          {results.length > 0 && (
            <VideoResultList
              items={results}
              selectedVideoId={selectedVideoId}
              onPick={onPick}
              onEndReached={nextPageToken ? loadMore : undefined}
              loading={searching}
            />
          )}
        </div>
      )}
    </div>
  );
};
