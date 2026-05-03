'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
};

const getSnapshot = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
};

const getServerSnapshot = (): boolean => false;

export const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
