'use client';

import { useEffect } from 'react';

export const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return null;
};
