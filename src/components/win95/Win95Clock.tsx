'use client';

import { useEffect, useState } from 'react';
import { formatWin95Clock } from '@/utils/win95';

export const Win95Clock = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(formatWin95Clock(new Date()));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  // Render nothing on the server / first paint to avoid a hydration time mismatch.
  if (!time) return null;

  return (
    <div className="win95-statusbar-field flex items-center px-2 text-[11px]" aria-label="Clock">
      {time}
    </div>
  );
};
