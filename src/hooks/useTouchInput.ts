'use client';

import { useEffect, useState } from 'react';

const COARSE_POINTER = '(pointer: coarse)';

// True when the primary pointer is a finger, or as soon as the user touches the screen
// (covers touchscreen laptops whose primary pointer is a mouse). Capability-based: no UA sniffing.
export const useTouchInput = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(COARSE_POINTER);
    const sync = () => {
      if (query.matches) setIsTouch(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') setIsTouch(true);
    };

    sync();
    query.addEventListener('change', sync);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => {
      query.removeEventListener('change', sync);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  return isTouch;
};
