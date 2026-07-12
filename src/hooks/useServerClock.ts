'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getBuzzedServerTime } from '@/api/buzzed';

const TICK_MS = 200;

// The resume countdown ticks against the server's clock, not the device's — otherwise a player with a
// skewed system clock sees the buzzer open at a different moment from everyone else.
export const useServerClock = () => {
  const offsetRef = useRef(0);
  const [, forceTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const sentAt = Date.now();
      const serverNow = await getBuzzedServerTime();
      if (cancelled || !serverNow) return;

      const roundTrip = Date.now() - sentAt;
      offsetRef.current = serverNow + roundTrip / 2 - Date.now();
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => forceTick(t => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const serverNow = useCallback(() => Date.now() + offsetRef.current, []);

  return { serverNow };
};
