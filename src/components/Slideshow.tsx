'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SlideshowProps {
  images: string[];
  interval?: number;
}

export default function Slideshow({ images, interval = 5000 }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-neutral-900">
        <p className="text-white text-xl">No images available</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-black touch-none">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              fill
              className="object-contain"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="100vw"
            />
          </div>
        </div>
      ))}

      {/* Navigation dots */}
      <div className="hidden md:flex absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 gap-2 sm:gap-3 z-10 pb-safe">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all touch-manipulation ${
              index === currentIndex
                ? 'bg-white scale-125 sm:scale-150'
                : 'bg-white/50 hover:bg-white/75 active:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
