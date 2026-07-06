'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { WatchListResponse, WatchStatus } from 'types/watch';
import { getWatchList } from 'api/watch';
import { WATCH_STATUS_LABELS, WATCH_STATUS_ORDER, groupByStatus } from 'utils/watch';
import { Loading } from 'components/Loading';
import { WatchSearch } from 'components/watch/WatchSearch';
import { WatchCard } from 'components/watch/WatchCard';
import { ServiceSettingsModal } from 'components/watch/ServiceSettingsModal';

const EMPTY: WatchListResponse = { items: [], settings: { country: 'us', services: [] } };

export const WatchLibrary = () => {
  const [data, setData] = useState<WatchListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WatchStatus>('watching');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Re-fetch after mutations (called from child event handlers, not from an effect).
  const refresh = useCallback(async () => {
    const result = await getWatchList();
    setData(result ?? EMPTY);
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
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
  }, []);

  const groups = useMemo(() => groupByStatus(data?.items ?? []), [data]);
  const services = data?.settings.services ?? [];
  const existingIds = useMemo(() => new Set((data?.items ?? []).map(item => item.id)), [data]);
  const activeItems = groups[activeTab];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-400">
          {services.length > 0
            ? `Highlighting what's on your ${services.length} service${services.length === 1 ? '' : 's'}.`
            : 'Set your streaming services to see what you can watch now.'}
        </p>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
        >
          My services
        </button>
      </div>

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
          </div>

          <div className="mt-6">
            {activeItems.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-500">
                Nothing in {WATCH_STATUS_LABELS[activeTab].toLowerCase()} yet. Search above to add something.
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
        onSaved={refresh}
      />
    </div>
  );
};
