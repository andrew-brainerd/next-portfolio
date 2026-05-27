'use client';

import { useState } from 'react';

interface VenueCarouselProps {
  images: string[];
  alt: string;
}

// Spotify-style square album-art dimensions don't apply here; Spotify aside,
// venue hero shots are usually 3:2 or 16:9. We render at 16:9 with object-cover
// so different aspect ratios all fill the slot without layout shift.
const SLOT_WIDTH = 640;
const SLOT_HEIGHT = 360;

export const VenueCarousel = ({ images, alt }: VenueCarouselProps) => {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];
  const showControls = images.length > 1;

  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);

  return (
    <div className="relative -mx-4 -mt-4 mb-3 group">
      <img
        src={current}
        alt={alt}
        width={SLOT_WIDTH}
        height={SLOT_HEIGHT}
        className="w-full aspect-video object-cover rounded-t-lg bg-neutral-800"
        loading="lazy"
      />
      {showControls && (
        <>
          <button
            onClick={prev}
            type="button"
            aria-label="Previous image"
            className="absolute top-1/2 left-2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity flex items-center justify-center cursor-pointer"
          >
            ‹
          </button>
          <button
            onClick={next}
            type="button"
            aria-label="Next image"
            className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity flex items-center justify-center cursor-pointer"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
