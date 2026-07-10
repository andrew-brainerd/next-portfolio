'use client';

import { useEffect, useMemo, useState } from 'react';

import type { BoardGrid, BoardNote, BoardScene, BoardWeather, SceneContext, WeatherStatus } from '@/types/board';
import { buildScenes } from '@/utils/boardScenes';

interface UseBoardRotationArgs extends BoardGrid {
  notes: BoardNote[];
  weather: BoardWeather | null;
  weatherStatus: WeatherStatus;
}

interface UseBoardRotationResult {
  grid: number[][];
  scene: BoardScene;
}

/**
 * Drives scene rotation for the board: advances through scenes on their dwell
 * timers and re-composes the active scene every second (so the clock's seconds
 * tick and only changed cells flip). Scenes are rebuilt when the notes change.
 */
export const useBoardRotation = ({
  rows,
  cols,
  notes,
  weather,
  weatherStatus
}: UseBoardRotationArgs): UseBoardRotationResult => {
  const scenes = useMemo(() => buildScenes(notes), [notes]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [now, setNow] = useState<Date>(() => new Date());

  // Clamp in case the scene list shrank (e.g. a note was deleted) since we last advanced.
  const safeIndex = scenes.length ? sceneIndex % scenes.length : 0;
  const scene = scenes[safeIndex];

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setSceneIndex(i => (i + 1) % scenes.length), scene.dwellMs);
    return () => clearTimeout(id);
  }, [safeIndex, scene, scenes.length]);

  const ctx = useMemo<SceneContext>(() => ({ now, weather, weatherStatus }), [now, weather, weatherStatus]);
  const grid = useMemo(() => scene.render(ctx, rows, cols), [scene, ctx, rows, cols]);

  return { grid, scene };
};
