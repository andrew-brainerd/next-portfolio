'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PageFlip } from 'page-flip';

import { getWeddingSoundMuted, playPageTurn, primeWeddingAudio, setWeddingSoundMuted } from '@/utils/weddingSound';

export interface StorybookPageDef {
  id: string;
  node: ReactNode;
  // Stiff cover-style flip (front/back covers)
  hard?: boolean;
}

interface StorybookReaderProps {
  pages: StorybookPageDef[];
}

interface FlipBookProps {
  pages: StorybookPageDef[];
  // Page to open on (the reader remounts the book to resize it — see below)
  startPage?: number;
  onPageChange?: (index: number) => void;
}

// Portrait 2:3 page fit to the viewport (Appendix B aspect ratio). 0.84 leaves
// the bottom margin the controls row sits in; the innerWidth term keeps the
// two-page spread (4/3 × height) within 92vw on narrow windows. Client-only —
// FlipBook never renders during SSR (the reader starts in scroll mode).
const computeBookSize = () => {
  const height = Math.round(Math.min(window.innerHeight * 0.84, 980, window.innerWidth * 0.69));
  return { width: Math.round((height * 2) / 3), height };
};

// Desktop book: StPageFlip two-page spread, dynamic-imported so it never ships
// to mobile. Init once per mount — the lib takes over the page elements' DOM,
// so `pages` must be stable after mount (they are: server-rendered props).
// Resizing is handled by the parent remounting us with a fresh `key`.
const FlipBook = ({ pages, startPage = 0, onPageChange }: FlipBookProps) => {
  const bookRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const [ready, setReady] = useState(false);
  const [pageIndex, setPageIndex] = useState(startPage);
  const [pageCount, setPageCount] = useState(pages.length);
  const [soundMuted, setSoundMuted] = useState(false);
  // Fixed for this mount (a resize remounts us); also drives the closed-book
  // centering shift from the very first paint.
  const [size] = useState(computeBookSize);
  // Refs keep the props out of the once-per-mount init effect's dependencies
  const startPageRef = useRef(startPage);
  const onPageChangeRef = useRef(onPageChange);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  useEffect(() => {
    setSoundMuted(getWeddingSoundMuted());

    let cancelled = false;
    let flip: PageFlip | undefined;

    (async () => {
      const { PageFlip } = await import('page-flip');
      if (cancelled || !bookRef.current) return;

      // StPageFlip sizes its internal block to the viewport and centers the
      // book in it, so the container is a full-viewport layer and the
      // controls float above it (see layout below).
      const { width, height } = size;

      flip = new PageFlip(bookRef.current, {
        width,
        height,
        size: 'fixed',
        startPage: startPageRef.current,
        showCover: true,
        usePortrait: false,
        maxShadowOpacity: 0.35,
        flippingTime: 700,
        mobileScrollSupport: false
      });
      flip.loadFromHTML(bookRef.current.querySelectorAll('.storybook-page'));

      // Pin the lib's wrapper to the exact spread size. Its own aspect-ratio
      // padding hack resolves against OUR container's width (percentage
      // padding), which breaks both sizing and centering — explicit
      // dimensions make the .stf__block (100%/100%) deterministic.
      const wrapper = bookRef.current.querySelector<HTMLElement>('.stf__wrapper');
      if (wrapper) {
        wrapper.style.width = `${width * 2}px`;
        wrapper.style.height = `${height}px`;
        wrapper.style.paddingBottom = '0';
      }
      // The lib computed page positions from the pre-pin wrapper box — its
      // resize handler recalculates them from the pinned dimensions.
      window.dispatchEvent(new Event('resize'));
      // The lib also mangles the container's own box (display/width), so pin
      // it to the spread too — the outer flex layer then centers the book.
      bookRef.current.style.width = `${width * 2}px`;
      bookRef.current.style.height = `${height}px`;

      flip.on('flip', event => {
        const index = event.data as number;
        setPageIndex(index);
        onPageChangeRef.current?.(index);
      });
      // 'flipping' = the turn animation starting (button, key, or corner drag)
      flip.on('changeState', event => {
        if (event.data === 'flipping') playPageTurn();
      });
      flipRef.current = flip;
      setPageCount(flip.getPageCount());
      setReady(true);
    })();

    return () => {
      cancelled = true;
      flip?.destroy();
      flipRef.current = null;
    };
  }, [size]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Never hijack keys while the guest is typing in a form (e.g. the RSVP page)
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'PageDown') {
        event.preventDefault();
        primeWeddingAudio();
        flipRef.current?.flipNext();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        primeWeddingAudio();
        flipRef.current?.flipPrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Closed covers render in one half of the spread area (front → right half,
  // back → left half), so shift the book to center the visible cover; the
  // transform transition matches flippingTime, sliding the book into its
  // spread position as the cover turns.
  const atBackCover = ready && pageIndex >= pageCount - 1;
  const coverShift = pageIndex === 0 ? -size.width / 2 : atBackCover ? size.width / 2 : 0;

  return (
    <div className="storybook-backdrop relative h-dvh overflow-hidden">
      {/* Outer layer centers the book; the lib rewrites styles on its own
          container (bookRef), so that one stays inside, pinned to book size */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="transition-transform duration-700 ease-in-out" style={{ transform: `translateX(${coverShift}px)` }}>
          <div ref={bookRef}>
            {pages.map(page => (
              <div key={page.id} className="storybook-page" data-density={page.hard ? 'hard' : 'soft'}>
                {page.node}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            primeWeddingAudio();
            flipRef.current?.flipPrev();
          }}
          aria-label="Previous page"
          className="rounded-full border border-[var(--sb-gold)] bg-[var(--sb-white)] px-4 py-1.5 text-[var(--sb-ink)] transition-colors hover:bg-[var(--sb-gold)]/30"
        >
          ‹
        </button>
        <p className="min-w-24 text-center font-garamond text-sm text-[var(--sb-ink)]/70" aria-live="polite">
          {pageIndex + 1} / {pageCount}
        </p>
        <button
          type="button"
          onClick={() => {
            primeWeddingAudio();
            flipRef.current?.flipNext();
          }}
          aria-label="Next page"
          className="rounded-full border border-[var(--sb-gold)] bg-[var(--sb-white)] px-4 py-1.5 text-[var(--sb-ink)] transition-colors hover:bg-[var(--sb-gold)]/30"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => {
            primeWeddingAudio();
            const next = !soundMuted;
            setSoundMuted(next);
            setWeddingSoundMuted(next);
          }}
          aria-label={soundMuted ? 'Unmute page-turn sound' : 'Mute page-turn sound'}
          aria-pressed={!soundMuted}
          className="rounded-full border border-[var(--sb-gold)] bg-[var(--sb-white)] p-2 text-[var(--sb-ink)] transition-colors hover:bg-[var(--sb-gold)]/30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M3 6.5H6L10 3.5V12.5L6 9.5H3Z" fill="currentColor" stroke="none" />
            {soundMuted ? (
              <path d="M11.5 6 L14.5 10 M14.5 6 L11.5 10" strokeLinecap="round" />
            ) : (
              <path d="M11.5 5.5A3.5 3.5 0 0 1 11.5 10.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * The responsive storybook (spec §6): desktop gets the StPageFlip two-page
 * spread; mobile — and anyone preferring reduced motion — gets a scroll-snap
 * stack of full-viewport pages (the book always readable as a linear scroll).
 */
export const StorybookReader = ({ pages }: StorybookReaderProps) => {
  // Pre-mount (and SSR) renders the scroll book — works without JS
  const [mode, setMode] = useState<'scroll' | 'flip'>('scroll');
  // StPageFlip is fixed-size once initialized, so a real window resize rebuilds
  // the book: bump this epoch to remount FlipBook at the recomputed dimensions,
  // reopening on the page the guest was reading.
  const [sizeEpoch, setSizeEpoch] = useState(0);
  const [lastIndex, setLastIndex] = useState(0);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compute = () => setMode(desktop.matches && !reducedMotion.matches ? 'flip' : 'scroll');
    compute();
    desktop.addEventListener('change', compute);
    reducedMotion.addEventListener('change', compute);
    return () => {
      desktop.removeEventListener('change', compute);
      reducedMotion.removeEventListener('change', compute);
    };
  }, []);

  useEffect(() => {
    // FlipBook's init dispatches a synthetic `resize` for the lib's own layout,
    // so only react to events where the viewport dimensions actually changed.
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let timer: number | undefined;
    const onResize = () => {
      if (window.innerWidth === lastWidth && window.innerHeight === lastHeight) return;
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setSizeEpoch(epoch => epoch + 1), 250);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (mode === 'flip') {
    return (
      <main className="storybook">
        <FlipBook key={sizeEpoch} pages={pages} startPage={lastIndex} onPageChange={setLastIndex} />
      </main>
    );
  }

  return (
    <main className="storybook h-dvh snap-y snap-mandatory overflow-y-auto bg-[var(--sb-cream)]">
      {pages.map(page => (
        <section key={page.id} className="h-dvh w-full snap-start">
          {page.node}
        </section>
      ))}
    </main>
  );
};
