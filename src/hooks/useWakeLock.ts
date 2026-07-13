'use client';

import { useEffect } from 'react';

// Keeps the screen awake during a game. A buzzer is the one app where you sit perfectly still for minutes
// and then need to react in under a second — a locked screen loses you the ring-in.
//
// Supported in Chrome/Android and Safari 16.4+ on iOS. The subtlety: the browser RELEASES the lock
// whenever the page is hidden (tab switch, screen off, app backgrounded) and never restores it, so
// re-acquiring on `visibilitychange` is what makes it actually work for the length of a game rather than
// silently dying the first time you glance away.
export const useWakeLock = (active: boolean) => {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        sentinel = await navigator.wakeLock.request('screen');
      } catch {
        // Denied (low battery, unsupported, not user-activated) — the game still works, the screen just sleeps.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release().catch(() => undefined);
    };
  }, [active]);
};
