'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Per-browser preference for whether to show titles only available to rent/buy. Backed by localStorage
// via useSyncExternalStore so it's SSR-safe (no hydration mismatch, no setState-in-effect).
const KEY = 'watch:showRentalTitles';
const listeners = new Set<() => void>();

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
};

const getSnapshot = (): boolean => typeof window !== 'undefined' && localStorage.getItem(KEY) !== 'false';

const getServerSnapshot = (): boolean => true;

export const useShowRentalTitles = (): [boolean, (value: boolean) => void] => {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback((next: boolean) => {
    localStorage.setItem(KEY, String(next));
    listeners.forEach(listener => listener());
  }, []);

  return [value, setValue];
};
