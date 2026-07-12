'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getBuzzedServerTime } from '@/api/buzzed';

const TICK_MS = 200;

// Every client counts the resume countdown down against the SERVER's clock, not its own — otherwise a
// player with a skewed system clock sees a different countdown from everyone else, and the buzzer
// appears to open at the wrong moment. `serverNow()` is the local clock plus a measured offset.
//
// The offset is sampled once on mount. Round-trip time is halved and folded in, which is crude, but the
// countdown is 5 seconds long — being off by tens of milliseconds is invisible.
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

  // Re-render on a tick so countdowns and the buzzer's live/dead state stay honest without every
  // consumer wiring up its own interval.
  useEffect(() => {
    const id = setInterval(() => forceTick(t => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const serverNow = useCallback(() => Date.now() + offsetRef.current, []);

  return { serverNow };
};
