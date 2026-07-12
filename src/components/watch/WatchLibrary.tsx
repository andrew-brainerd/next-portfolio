'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { WatchListResponse, WatchStatus } from 'types/watch';
import { getWatchList } from 'api/watch';
import { syncYoutubeWatchlist } from 'api/youtube';
import { WATCH_STATUS_LABELS, WATCH_STATUS_ORDER, groupByStatus, requiresRental } from 'utils/watch';
import { useShowRentalTitles } from 'hooks/useShowRentalTitles';
import { Loading } from 'components/Loading';
import { WatchSearch } from 'components/watch/WatchSearch';
import { WatchCard } from 'components/watch/WatchCard';
import { ServiceSettingsModal } from 'components/watch/ServiceSettingsModal';

const EMPTY: WatchListResponse = { items: [], settings: { country: 'us', services: [] } };

interface WatchLibraryProps {
  // When YouTube is connected, auto-sync the "Watchlist" playlist before the first list load so newly
  // added videos show up on open.
  youtubeConnected?: boolean;
  // Set after the OAuth redirect (?youtube=connected|error); opens Settings so the result is visible
  // (the YouTube connection lives in the Settings modal now).
  youtubeNotice?: 'connected' | 'error' | null;
}

export const WatchLibrary = ({ youtubeConnected = false, youtubeNotice = null }: WatchLibraryProps) => {
  const [data, setData] = useState<WatchListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WatchStatus | 'favorites'>('watching');
  const [settingsOpen, setSettingsOpen] = useState(Boolean(youtubeNotice));
  const [syncNotice, setSyncNotice] = useState<{ tone: 'error' | 'warn' | 'info'; text: string } | null>(null);
  const [showRentalTitles, setShowRentalTitles] = useShowRentalTitles();

  // Re-fetch after mutations (called from child event handlers, not from an effect).
  const refresh = useCallback(async () => {
    const result = await getWatchList();
    setData(result ?? EMPTY);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      // Pull in newly-added "Watchlist" videos before showing the list. Surface the outcome so a failed
      // sync (or a missing "Watchlist" playlist) isn't invisible; it never blocks the list.
      if (youtubeConnected) {
        const sync = await syncYoutubeWatchlist();
        if (active) {
          if (sync.error) {
            setSyncNotice({
              tone: 'error',
              text: `Couldn't sync your YouTube “Watchlist” playlist (${sync.error}). Check Settings → YouTube; details are in the server logs.`
            });
          } else if (sync.playlistFound === false) {
            setSyncNotice({
              tone: 'warn',
              text: 'No YouTube playlist named “Watchlist” was found. Rename a playlist to “Watchlist”, or import manually from Settings → YouTube.'
            });
          } else if (sync.imported > 0) {
            setSyncNotice({
              tone: 'info',
              text: `Imported ${sync.imported} new video${sync.imported === 1 ? '' : 's'} from your YouTube Watchlist.`
            });
          }
        }
      }
      const result = await getWatchList();
      if (active) {
        setData(result ?? EMPTY);
        setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [youtubeConnected]);

  // Status tabs respect the rental filter (counts + items stay consistent); favorites always show all.
  const groups = useMemo(() => {
    const items = data?.items ?? [];
    return groupByStatus(showRentalTitles ? items : items.filter(item => !requiresRental(item)));
  }, [data, showRentalTitles]);
  const favorites = useMemo(() => (data?.items ?? []).filter(item => item.favorite), [data]);
  const services = data?.settings.services ?? [];
  const existingIds = useMemo(() => new Set((data?.items ?? []).map(item => item.id)), [data]);
  const activeItems = activeTab === 'favorites' ? favorites : groups[activeTab];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-400">
          {services.length > 0
            ? `Highlighting what's on your ${services.length} service${services.length === 1 ? '' : 's'}.`
            : 'Set your streaming services to see what you can watch now.'}
        </p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-sm text-neutral-400" title="Show titles only available to rent or buy">
            <input
              type="checkbox"
              checked={showRentalTitles}
              onChange={e => setShowRentalTitles(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            Show rentals
          </label>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
          >
            Settings
          </button>
        </div>
      </div>

      {syncNotice && (
        <div
          className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
            syncNotice.tone === 'error'
              ? 'border-red-500/40 bg-red-500/10 text-red-300'
              : syncNotice.tone === 'warn'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          <span>{syncNotice.text}</span>
          <button
            type="button"
            onClick={() => setSyncNotice(null)}
            aria-label="Dismiss"
            className="shrink-0 leading-none opacity-70 transition-opacity hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <WatchSearch existingIds={existingIds} onChanged={refresh} />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loading />
          <p className="mt-4 text-gray-400">Loading your library…</p>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Watch lists" className="mt-8 flex flex-wrap gap-1 border-b border-neutral-700">
            {WATCH_STATUS_ORDER.map(status => (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={activeTab === status}
                onClick={() => setActiveTab(status)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === status
                    ? 'border-brand-400 text-white'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {WATCH_STATUS_LABELS[status]} ({groups[status].length})
              </button>
            ))}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'favorites'}
              onClick={() => setActiveTab('favorites')}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'border-brand-400 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Favorites ({favorites.length})
            </button>
          </div>

          <div className="mt-6">
            {activeItems.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-500">
                {activeTab === 'favorites'
                  ? 'No favorites yet. Tap the star on a title to add it here.'
                  : `Nothing in ${WATCH_STATUS_LABELS[activeTab].toLowerCase()} yet. Search above to add something.`}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeItems.map(item => (
                  <WatchCard key={item.id} item={item} services={services} onChanged={refresh} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ServiceSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentServices={services}
        youtubeConnected={youtubeConnected}
        youtubeNotice={youtubeNotice}
        onSaved={refresh}
      />
    </div>
  );
};
