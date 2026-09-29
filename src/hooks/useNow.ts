'use client';

import { useEffect, useState } from 'react';

/**
 * Current time plus `offsetMs`, re-read every `intervalMs`. Seeded with the server's clock so the first paint matches.
 * `offsetMs` is the wedding admins' mock clock (0 otherwise).
 */
export const useNow = (initialNow: number, offsetMs = 0, intervalMs = 60_000): number => {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const tick = () => setNow(Date.now() + offsetMs);
    // Catch up at once in case the server-rendered page was restored from cache
    const catchUp = setTimeout(tick, 0);
    const timer = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(catchUp);
      clearInterval(timer);
    };
  }, [offsetMs, intervalMs]);

  return now;
};
