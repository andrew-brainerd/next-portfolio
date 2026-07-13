'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';

import { getYoutubeConnection, getYoutubePlaylists, getYoutubePlaylistItems } from '@/api/youtube';
import { VideoLinkInput } from '@/components/buzzed/VideoLinkInput';
import type { YoutubePlaylist, YoutubePlaylistItem } from '@/types/watch';

interface VideoPickerProps {
  // The raw link field. Picking from a playlist writes the chosen video's URL into it, so the caller
  // keeps one source of truth and doesn't care which route the host took.
  value: string;
  onChange: (value: string) => void;
  // Where to come back to after the Google consent screen.
  returnPath: string;
  id?: string;
}

type Mode = 'link' | 'playlist';

export const VideoPicker = ({ value, onChange, returnPath, id }: VideoPickerProps) => {
  const [mode, setMode] = useState<Mode>('link');
  const [connected, setConnected] = useState<boolean | null>(null);
  const [playlists, setPlaylists] = useState<YoutubePlaylist[]>([]);
  const [playlistId, setPlaylistId] = useState('');
  const [items, setItems] = useState<YoutubePlaylistItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  const onPickPlaylist = async (id: string) => {
    setPlaylistId(id);
    setItems([]);
    if (!id) return;

    setLoading(true);
    try {
      setItems(await getYoutubePlaylistItems(id));
    } finally {
      setLoading(false);
    }
  };

  // A top-level browser navigation, not an XHR — the callback identifies the user by the brainerd session
  // cookie. `from` rides through Google as the OAuth `state` so we land back here and not on /watch.
  const connectHref = `${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/watch/youtube/auth?from=${encodeURIComponent(returnPath)}`;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['link', 'playlist'] as Mode[]).map(option => (
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
            {option === 'link' ? 'Paste a link' : 'From a playlist'}
          </button>
        ))}
      </div>

      {mode === 'link' && <VideoLinkInput value={value} onChange={onChange} id={id} />}

      {mode === 'playlist' && connected === false && (
        <div className="rounded-md border border-neutral-800 bg-neutral-900/60 p-4 text-center">
          <p className="text-sm text-neutral-300">Connect YouTube to pick from your playlists.</p>
          <p className="mt-1 text-xs text-neutral-500">Read-only — Buzzed only lists your playlists.</p>
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
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {items.map(item => {
                const url = `https://www.youtube.com/watch?v=${item.videoId}`;
                const selected = value.includes(item.videoId);

                return (
                  <li key={item.videoId}>
                    <button
                      type="button"
                      onClick={() => onChange(url)}
                      className={`flex w-full items-center gap-3 rounded-md border p-2 text-left ${
                        selected
                          ? 'border-brand-500 bg-brand-600/15'
                          : 'border-transparent hover:bg-neutral-800/60'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{item.title}</p>
                        {item.channelTitle && (
                          <p className="truncate text-xs text-neutral-500">{item.channelTitle}</p>
                        )}
                      </div>
                      {selected && <span className="shrink-0 text-xs text-brand-400">Selected</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
