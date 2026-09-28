'use client';

import { useCallback, useSyncExternalStore } from 'react';

const changeEvent = (key: string) => `local-json:${key}`;

/**
 * A JSON value in localStorage, shared live by every component using the same key.
 * Renders `undefined` on the server and first client paint (no hydration mismatch).
 */
export const useLocalJson = <T>(key: string): [T | undefined, (value: T | undefined) => void] => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener('storage', onChange);
      window.addEventListener(changeEvent(key), onChange);
      return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener(changeEvent(key), onChange);
      };
    },
    [key]
  );

  const read = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  // Snapshot is the raw string so useSyncExternalStore compares by value
  const raw = useSyncExternalStore(subscribe, read, () => null);

  const setValue = useCallback(
    (value: T | undefined) => {
      try {
        if (value === undefined) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage blocked — the value just won't persist
      }
      window.dispatchEvent(new Event(changeEvent(key)));
    },
    [key]
  );

  let value: T | undefined;
  try {
    value = raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    value = undefined;
  }

  return [value, setValue];
};
