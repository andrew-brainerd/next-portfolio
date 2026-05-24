/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/components/peapod/Modal';
import type { AppScreenshot } from '@/types/apps';

interface ScreenshotGalleryProps {
  screenshots: AppScreenshot[];
}

function Placeholder({ caption }: { caption: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-700/60 to-neutral-800/60 p-4 text-center">
      <svg className="h-10 w-10 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="M21 15l-5-5L7 18" />
      </svg>
      <span className="text-xs text-neutral-300">{caption}</span>
      <span className="text-[10px] uppercase tracking-wide text-neutral-500">Screenshot coming soon</span>
    </div>
  );
}

export const ScreenshotGallery = ({ screenshots }: ScreenshotGalleryProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const markFailed = useCallback((src: string) => {
    setFailed(prev => (prev[src] ? prev : { ...prev, [src]: true }));
  }, []);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex(prev => (prev === null ? prev : (prev + delta + screenshots.length) % screenshots.length)),
    [screenshots.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openIndex, step]);

  if (screenshots.length === 0) return null;

  const active = openIndex === null ? null : screenshots[openIndex];

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Screenshots">
        {screenshots.map((shot, index) => (
          <li key={shot.src}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group block w-full overflow-hidden rounded-2xl border border-neutral-500/20 bg-neutral-800/40 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-brand-400/40 hover:shadow-brand-500/20 focus:outline-none focus:ring-2 focus:ring-brand-400"
              aria-label={`View screenshot: ${shot.caption}`}
            >
              <div className="relative aspect-[16/10] w-full">
                {failed[shot.src] ? (
                  <Placeholder caption={shot.caption} />
                ) : (
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={() => markFailed(shot.src)}
                  />
                )}
              </div>
              <p className="px-4 py-3 text-left text-sm text-neutral-300">{shot.caption}</p>
            </button>
          </li>
        ))}
      </ul>

      <Modal isOpen={active !== null} onClose={close}>
        {active && (
          <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-neutral-800 shadow-2xl">
            <div className="relative aspect-[16/10] w-full bg-neutral-900">
              {failed[active.src] ? (
                <Placeholder caption={active.caption} />
              ) : (
                <img
                  src={active.src}
                  alt={active.alt}
                  className="h-full w-full object-contain"
                  onError={() => markFailed(active.src)}
                />
              )}
              {screenshots.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    aria-label="Previous screenshot"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    aria-label="Next screenshot"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <p className="text-sm text-neutral-200">{active.caption}</p>
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
