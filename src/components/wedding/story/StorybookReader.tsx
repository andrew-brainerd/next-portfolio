'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { PageFlip } from 'page-flip';

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
}

// Desktop book: StPageFlip two-page spread, dynamic-imported so it never ships
// to mobile. Init once per mount — the lib takes over the page elements' DOM,
// so `pages` must be stable after mount (they are: server-rendered props).
const FlipBook = ({ pages }: FlipBookProps) => {
  const bookRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const [ready, setReady] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(pages.length);

  useEffect(() => {
    let cancelled = false;
    let flip: PageFlip | undefined;

    (async () => {
      const { PageFlip } = await import('page-flip');
      if (cancelled || !bookRef.current) return;

      // Portrait 2:3 page fit to the viewport (Appendix B aspect ratio).
      // StPageFlip sizes its internal block to the viewport and centers the
      // book in it, so the container is a full-viewport layer and the
      // controls float above it (see layout below). 0.78 leaves the bottom
      // margin the controls row sits in.
      const height = Math.round(Math.min(window.innerHeight * 0.78, 860));
      const width = Math.round((height * 2) / 3);

      flip = new PageFlip(bookRef.current, {
        width,
        height,
        size: 'fixed',
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

      flip.on('flip', event => setPageIndex(event.data as number));
      flipRef.current = flip;
      setPageCount(flip.getPageCount());
      setReady(true);
    })();

    return () => {
      cancelled = true;
      flip?.destroy();
      flipRef.current = null;
    };
  }, []);

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
        flipRef.current?.flipNext();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        flipRef.current?.flipPrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="relative h-dvh overflow-hidden bg-[var(--sb-cream)]">
      {/* Outer layer centers the book; the lib rewrites styles on its own
          container (bookRef), so that one stays inside, pinned to book size */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        <div ref={bookRef}>
          {pages.map(page => (
            <div key={page.id} className="storybook-page" data-density={page.hard ? 'hard' : 'soft'}>
              {page.node}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => flipRef.current?.flipPrev()}
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
          onClick={() => flipRef.current?.flipNext()}
          aria-label="Next page"
          className="rounded-full border border-[var(--sb-gold)] bg-[var(--sb-white)] px-4 py-1.5 text-[var(--sb-ink)] transition-colors hover:bg-[var(--sb-gold)]/30"
        >
          ›
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

  if (mode === 'flip') {
    return (
      <main className="storybook">
        <FlipBook pages={pages} />
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
