'use client';

import { useEffect, useState } from 'react';

import type { YoutubePlaylist, YoutubePlaylistItem } from 'types/watch';
import { getYoutubePlaylistItems, getYoutubePlaylists } from 'api/youtube';
import { Loading } from 'components/Loading';

// Browse the connected account's YouTube playlists. Clicking a playlist lazily loads its videos.
// Display-only for now — importing into the watchlist arrives with Y-B.
export const YoutubePlaylists = () => {
  const [playlists, setPlaylists] = useState<YoutubePlaylist[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, YoutubePlaylistItem[]>>({});
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const result = await getYoutubePlaylists();
      if (active) setPlaylists(result);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const toggle = async (id: string) => {
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

  if (!playlists) return <Loading />;

  if (playlists.length === 0) {
    return <p className="text-sm text-neutral-400">No playlists found on this account.</p>;
  }

  return (
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
                <span className="block truncate font-medium text-white">{playlist.title}</span>
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
                  <ul className="flex flex-col gap-2">
                    {playlistItems.map(item => (
                      <li key={item.videoId} className="flex items-center gap-3">
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
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-400">No videos in this playlist.</p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};
