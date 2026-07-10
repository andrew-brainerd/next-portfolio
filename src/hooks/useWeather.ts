'use client';

import { useEffect, useRef, useState } from 'react';

import type { BoardWeather, BoardWeatherLocation, WeatherStatus } from '@/types/board';
import { fetchWeather, reverseGeocode } from '@/utils/weather';

const REFRESH_MS = 10 * 60 * 1000;

interface UseWeatherArgs {
  // Persisted location (from board settings). If set, used directly — no geolocation.
  savedLocation: BoardWeatherLocation | null;
  // Gate: don't resolve a location until settings have loaded (so we know whether one is saved).
  ready: boolean;
  // Called with a freshly geolocated location so the caller can persist it to Firebase.
  onResolveLocation?: (location: BoardWeatherLocation) => void;
}

interface UseWeatherResult {
  weather: BoardWeather | null;
  status: WeatherStatus;
}

export const useWeather = ({ savedLocation, ready, onResolveLocation }: UseWeatherArgs): UseWeatherResult => {
  const [weather, setWeather] = useState<BoardWeather | null>(null);
  const [status, setStatus] = useState<WeatherStatus>('loading');
  const coordsRef = useRef<BoardWeatherLocation | null>(null);
  const hasDataRef = useRef(false);
  const savedRef = useRef(savedLocation);
  const onResolveRef = useRef(onResolveLocation);

  // Keep latest props in refs so the resolution effect can read them without
  // depending on their (churning) identity. Runs before the effect below.
  useEffect(() => {
    savedRef.current = savedLocation;
    onResolveRef.current = onResolveLocation;
  });

  const savedKey = savedLocation ? `${savedLocation.lat},${savedLocation.lon}` : '';

  useEffect(() => {
    if (!ready) return;
    let active = true;
    let refreshId: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      const coords = coordsRef.current;
      if (!coords) return;
      try {
        const next = await fetchWeather(coords.lat, coords.lon, coords.label, coords.unit ?? 'F');
        if (!active) return;
        hasDataRef.current = true;
        setWeather(next);
        setStatus('ready');
      } catch {
        if (active && !hasDataRef.current) setStatus('unavailable');
      }
    };

    const startWithCoords = async (coords: BoardWeatherLocation, persist: boolean) => {
      coordsRef.current = coords;
      if (persist) onResolveRef.current?.(coords);
      await refresh();
      if (active) refreshId = setInterval(refresh, REFRESH_MS);
    };

    const start = () => {
      const saved = savedRef.current;
      if (saved) {
        void startWithCoords(saved, false);
        return;
      }
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        if (active) setStatus('unavailable');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async position => {
          if (!active) return;
          const { latitude, longitude } = position.coords;
          const label = await reverseGeocode(latitude, longitude);
          void startWithCoords({ lat: latitude, lon: longitude, label, unit: 'F' }, true);
        },
        () => {
          if (active) setStatus('unavailable');
        },
        { timeout: 10000, maximumAge: REFRESH_MS }
      );
    };

    // Defer so no state is set synchronously during the effect.
    queueMicrotask(start);

    return () => {
      active = false;
      if (refreshId) clearInterval(refreshId);
    };
  }, [ready, savedKey]);

  return { weather, status };
};
