'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { YoutubePlaylist, YoutubePlaylistItem } from 'types/watch';
import { getYoutubePlaylistItems, getYoutubePlaylists, importYoutubeVideos } from 'api/youtube';
import { Loading } from 'components/Loading';

// A playlist literally named "Watchlist" is the intended import source, so float it to the top.
const isWatchlistPlaylist = (playlist: YoutubePlaylist): boolean => playlist.title.trim().toLowerCase() === 'watchlist';

const watchlistFirst = (playlists: YoutubePlaylist[]): YoutubePlaylist[] =>
  [...playlists].sort((a, b) => Number(isWatchlistPlaylist(b)) - Number(isWatchlistPlaylist(a)));

// Browse the connected account's YouTube playlists; expand one to select videos and import them into the
// watchlist. Only one playlist is expanded at a time, so selection is a single set cleared on switch.
export const YoutubePlaylists = () => {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<YoutubePlaylist[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, YoutubePlaylistItem[]>>({});
  const [loadingItems, setLoadingItems] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const result = await getYoutubePlaylists();
      if (active) setPlaylists(watchlistFirst(result));
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const toggle = async (id: string) => {
    setMessage(null);
    setSelected(new Set());
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!items[id]) {
      setLoadingItems(true);
      const result = await getYoutubePlaylistItems(id);
      setItems(prev => ({ ...prev, [id]: result }));
      setLoadingItems(false);
    }
  };

  const toggleSelected = (videoId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const selectAll = (playlistItems: YoutubePlaylistItem[]) => {
    setSelected(prev =>
      prev.size === playlistItems.length ? new Set() : new Set(playlistItems.map(item => item.videoId))
    );
  };

  const importSelected = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setMessage(null);
    try {
      const result = await importYoutubeVideos([...selected]);
      const parts = [`Imported ${result.imported}`];
      if (result.skipped > 0) parts.push(`${result.skipped} already in your library`);
      setMessage(`${parts.join(' · ')}. Reload to see them in your Watchlist.`);
      setSelected(new Set());
      router.refresh();
    } catch {
      setMessage('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  if (!playlists) return <Loading />;

  if (playlists.length === 0) {
    return <p className="text-sm text-neutral-400">No playlists found on this account.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {message && <p className="text-sm text-emerald-400">{message}</p>}
      <ul className="flex flex-col gap-2">
        {playlists.map(playlist => {
          const expanded = expandedId === playlist.id;
          const playlistItems = items[playlist.id];
          return (
            <li key={playlist.id} className="overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
              <button
                type="button"
                onClick={() => toggle(playlist.id)}
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-neutral-800"
              >
                {playlist.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={playlist.thumbnail} alt="" className="h-12 w-20 flex-shrink-0 rounded object-cover" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium text-white">{playlist.title}</span>
                    {isWatchlistPlaylist(playlist) && (
                      <span className="shrink-0 rounded bg-brand-600/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-300">
                        Watchlist
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-neutral-400">{playlist.itemCount} videos</span>
                </span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {expanded && (
                <div className="border-t border-neutral-800 p-3">
                  {loadingItems && !playlistItems ? (
                    <Loading />
                  ) : playlistItems && playlistItems.length > 0 ? (
                    <>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => selectAll(playlistItems)}
                          className="text-xs text-neutral-300 underline hover:text-white"
                        >
                          {selected.size === playlistItems.length ? 'Clear all' : 'Select all'}
                        </button>
                        <button
                          type="button"
                          onClick={importSelected}
                          disabled={selected.size === 0 || importing}
                          className="rounded bg-brand-600 px-3 py-1 text-xs text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
                        >
                          {importing ? 'Importing…' : `Import selected (${selected.size})`}
                        </button>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {playlistItems.map(item => (
                          <li key={item.videoId}>
                            <label className="flex cursor-pointer items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selected.has(item.videoId)}
                                onChange={() => toggleSelected(item.videoId)}
                                className="h-4 w-4 flex-shrink-0 accent-brand-600"
                              />
                              {item.thumbnail && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.thumbnail} alt="" className="h-10 w-16 flex-shrink-0 rounded object-cover" />
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm text-white">{item.title}</span>
                                {item.channelTitle && (
                                  <span className="block truncate text-xs text-neutral-500">{item.channelTitle}</span>
                                )}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm text-neutral-400">No videos in this playlist.</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
