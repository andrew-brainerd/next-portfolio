'use client';

import { useEffect, useRef } from 'react';

import type { YoutubePlaylistItem } from '@/types/watch';

interface VideoResultListProps {
  items: YoutubePlaylistItem[];
  selectedVideoId: string | null;
  onPick: (videoId: string) => void;
  // Omit for a list that's already whole (a playlist). Search pages in 10 at a time.
  onEndReached?: () => void;
  loading?: boolean;
}

export const VideoResultList = ({
  items,
  selectedVideoId,
  onPick,
  onEndReached,
  loading
}: VideoResultListProps) => {
  const scrollRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  // Held in a ref so a new inline callback each render doesn't tear down and rebuild the observer.
  const onEndReachedRef = useRef(onEndReached);
  useEffect(() => {
    onEndReachedRef.current = onEndReached;
  }, [onEndReached]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !onEndReached) return;

    // `root` is the scrolling <ul>, not the viewport — the list scrolls inside its own box, so a
    // viewport-rooted observer would fire on mount and never again.
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) onEndReachedRef.current?.();
      },
      { root: scrollRef.current, rootMargin: '120px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // items.length re-runs it so the sentinel is re-observed after each page appends.
  }, [onEndReached, items.length]);

  return (
    <ul ref={scrollRef} className="max-h-72 space-y-1 overflow-y-auto">
      {items.map(item => {
        const selected = item.videoId === selectedVideoId;

        return (
          <li key={item.videoId}>
            <button
              type="button"
              onClick={() => onPick(item.videoId)}
              className={`flex w-full items-center gap-3 rounded-md border p-2 text-left ${
                selected ? 'border-brand-500 bg-brand-600/15' : 'border-transparent hover:bg-neutral-800/60'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbnail} alt="" className="h-12 w-20 shrink-0 rounded object-cover" />
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

      {onEndReached && (
        <li ref={sentinelRef} className="py-2 text-center text-xs text-neutral-600">
          {loading ? 'Loading…' : ''}
        </li>
      )}
    </ul>
  );
};
