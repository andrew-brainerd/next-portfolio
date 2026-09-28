'use client';

import { useEffect, useState } from 'react';

/** Current time, re-read every `intervalMs`. Seeded with the server's clock so the first paint matches. */
export const useNow = (initialNow: number, intervalMs = 60_000): number => {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    // Catch up at once in case the server-rendered page was restored from cache
    const catchUp = setTimeout(tick, 0);
    const timer = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(catchUp);
      clearInterval(timer);
    };
  }, [intervalMs]);

  return now;
};
