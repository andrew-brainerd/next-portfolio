'use client';

import { useState } from 'react';

import type { WatchListItem, WatchStatus } from 'types/watch';
import { removeFromWatch, updateWatchItem } from 'api/watch';
import { WATCH_STATUS_LABELS, WATCH_STATUS_ORDER, hasLeavingSoon, splitAvailability } from 'utils/watch';
import { MoreOptionsModal } from 'components/watch/MoreOptionsModal';
import { TrailerModal } from 'components/watch/TrailerModal';

interface WatchCardProps {
  item: WatchListItem;
  services: string[];
  onChanged: () => void | Promise<void>;
}

export const WatchCard = ({ item, services, onChanged }: WatchCardProps) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const media = item.media;
  const { primary, more } = splitAvailability(media?.streamingOptions ?? [], services);

  const changeStatus = async (status: WatchStatus) => {
    if (status === item.status) return;
    setBusy(true);
    try {
      await updateWatchItem(item.id, { status });
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await removeFromWatch(item.id);
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900/50">
      <div className="flex gap-3 p-3">
        {media?.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.poster} alt={media.title} className="h-28 w-20 shrink-0 rounded object-cover" />
        ) : (
          <div className="h-28 w-20 shrink-0 rounded bg-neutral-800" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight text-white">{media?.title ?? item.id}</h3>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              aria-label="Remove from library"
              className="shrink-0 text-lg leading-none text-neutral-500 hover:text-red-400 disabled:opacity-50"
            >
              ×
            </button>
          </div>

          <p className="mt-0.5 text-xs text-neutral-400">
            {media?.showType === 'series' ? 'Series' : 'Movie'}
            {media?.year ? ` · ${media.year}` : ''}
            {hasLeavingSoon(primary) && (
              <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-300">Leaving soon</span>
            )}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {primary.length > 0 ? (
              primary.map(option => (
                <a
                  key={option.service.id}
                  href={option.link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-brand-600 px-2 py-1 text-xs text-white transition-colors hover:bg-brand-700"
                >
                  ▶ {option.service.name}
                </a>
              ))
            ) : (
              <span className="text-xs text-neutral-500">
                {services.length > 0 ? 'Not on your services' : 'Set your services'}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {media?.trailer && (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="text-xs text-neutral-300 underline hover:text-white"
              >
                Trailer
              </button>
            )}
            {more.length > 0 && (
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className="text-xs text-neutral-300 underline hover:text-white"
              >
                More options ({more.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-neutral-800 px-3 py-2">
        <label className="text-xs text-neutral-500" htmlFor={`status-${item.id}`}>
          Status
        </label>
        <select
          id={`status-${item.id}`}
          value={item.status}
          disabled={busy}
          onChange={e => changeStatus(e.target.value as WatchStatus)}
          className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-200 disabled:opacity-50"
        >
          {WATCH_STATUS_ORDER.map(status => (
            <option key={status} value={status}>
              {WATCH_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <MoreOptionsModal isOpen={moreOpen} onClose={() => setMoreOpen(false)} title={media?.title ?? ''} options={more} />
      <TrailerModal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} title={media?.title ?? ''} trailer={media?.trailer} />
    </div>
  );
};
