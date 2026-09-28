'use client';

import { useCallback, useSyncExternalStore } from 'react';

import type { GuideMe } from '@/types/wedding';

const STORAGE_KEY = 'wedding:guide:me';
const CHANGE_EVENT = 'wedding-guide-me';

const read = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
};

const parse = (raw: string | null): GuideMe | undefined => {
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as GuideMe;
    return value.tableId && value.name ? value : undefined;
  } catch {
    return undefined;
  }
};

/** The guest's own seat, remembered on this device after "This is me". Shared by every component using it. */
export const useGuideMe = (): [GuideMe | undefined, (me: GuideMe | undefined) => void] => {
  // Snapshot is the raw string so useSyncExternalStore compares by value
  const raw = useSyncExternalStore(subscribe, read, () => null);

  const setMe = useCallback((me: GuideMe | undefined) => {
    try {
      if (me) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(me));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage blocked — the choice just won't persist
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [parse(raw), setMe];
};
