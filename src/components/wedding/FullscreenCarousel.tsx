'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Venue } from '@/types/wedding';

interface FullscreenCarouselProps {
  venue: Venue;
  onClose: () => void;
}

// Renders only when there's at least one image. Caller guards on imageUrls.length.
export const FullscreenCarousel = ({ venue, onClose }: FullscreenCarouselProps) => {
  const images = venue.imageUrls ?? [];
  const [index, setIndex] = useState(0);

  const prev = useCallback(() => {
    setIndex(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex(i => (i + 1) % images.length);
  }, [images.length]);

  // Keyboard navigation: ESC to close, arrows to navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  // Lock body scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  if (images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${venue.name} image gallery`}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 text-white">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold truncate">{venue.name}</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {venue.city} · {index + 1} of {images.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="ml-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-xl cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center relative px-2 sm:px-6 pb-6 overflow-hidden">
        <img
          src={current}
          alt={`${venue.name} ${index + 1}`}
          width={1920}
          height={1080}
          onClick={e => e.stopPropagation()}
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 sm:left-6 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl transition-colors flex items-center justify-center cursor-pointer"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next image"
              className="absolute top-1/2 right-2 sm:right-6 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl transition-colors flex items-center justify-center cursor-pointer"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="pb-6 flex justify-center gap-1.5" onClick={e => e.stopPropagation()}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
