'use client';

import { useEffect, useState } from 'react';
import { StartLogo } from '@/components/win95/Win95Icons';

const BOOT_MS = 900;

/**
 * Brief "Microsoft Windows 95" splash shown once when the shell mounts (i.e. when entering the
 * mode). Doubles as a mask for the one-frame normal→Win95 flash, since the mode flag can only be
 * read client-side after hydration. Respects prefers-reduced-motion by skipping the splash.
 */
export const Win95Boot = () => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion: dismiss on the next tick (skips the slide) rather than animating.
    const fade = setTimeout(() => setLeaving(true), reduce ? 0 : BOOT_MS - 200);
    const done = setTimeout(() => setVisible(false), reduce ? 150 : BOOT_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-200 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="win95-raised flex w-72 flex-col items-center gap-3 px-6 py-8">
        <StartLogo className="h-12 w-12" />
        <div className="text-center">
          <div className="text-[11px] text-neutral-600">Microsoft</div>
          <div className="text-2xl font-bold tracking-tight text-[#000080]">Windows 95</div>
        </div>
        <div className="win95-sunken mt-2 h-4 w-full overflow-hidden p-0.5">
          <div className="win95-boot-bar h-full w-1/3 bg-[#000080]" />
        </div>
      </div>
    </div>
  );
};
