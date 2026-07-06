'use client';

import { useEffect, useState } from 'react';

import type { WatchSearchResult, WatchStatus } from 'types/watch';
import { addToWatch, searchWatch } from 'api/watch';
import { WATCH_STATUS_LABELS, WATCH_STATUS_ORDER } from 'utils/watch';

interface WatchSearchProps {
  existingIds: Set<string>;
  onChanged: () => void | Promise<void>;
}

export const WatchSearch = ({ existingIds, onChanged }: WatchSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WatchSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    let active = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      const res = await searchWatch(q);
      if (active) {
        setResults(res ?? []);
        setSearching(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const add = async (result: WatchSearchResult, status: WatchStatus) => {
    setAddingId(result.id);
    try {
      await addToWatch({ id: result.id, showType: result.showType, status });
      await onChanged();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search movies & TV…"
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-brand-500 focus:outline-none"
      />

      {query.trim().length >= 2 && (
        <div className="mt-2 rounded-lg border border-neutral-800 bg-neutral-900/70">
          {searching && results.length === 0 ? (
            <p className="p-3 text-sm text-neutral-400">Searching…</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-neutral-500">No results</p>
          ) : (
            <ul className="max-h-96 divide-y divide-neutral-800 overflow-y-auto">
              {results.map(result => {
                const added = existingIds.has(result.id);
                return (
                  <li key={result.id} className="flex items-center gap-3 p-2.5">
                    {result.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={result.poster} alt={result.title} className="h-16 w-11 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="h-16 w-11 shrink-0 rounded bg-neutral-800" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{result.title}</p>
                      <p className="text-xs text-neutral-400">
                        {result.showType === 'series' ? 'Series' : 'Movie'}
                        {result.year ? ` · ${result.year}` : ''}
                      </p>
                    </div>
                    {added ? (
                      <span className="shrink-0 text-xs text-neutral-500">In library</span>
                    ) : (
                      <select
                        aria-label={`Add ${result.title} to a list`}
                        defaultValue=""
                        disabled={addingId === result.id}
                        onChange={e => {
                          const value = e.target.value as WatchStatus | '';
                          e.target.value = '';
                          if (value) add(result, value);
                        }}
                        className="shrink-0 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-200"
                      >
                        <option value="" disabled>
                          {addingId === result.id ? 'Adding…' : 'Add to…'}
                        </option>
                        {WATCH_STATUS_ORDER.map(status => (
                          <option key={status} value={status}>
                            {WATCH_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    )}
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
