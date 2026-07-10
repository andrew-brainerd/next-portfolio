'use client';

import { useCallback, useEffect, useState } from 'react';

import { getBoardNotes, getBoardSettings, updateBoardSettings } from '@/api/board';
import { useBoardRotation } from '@/hooks/useBoardRotation';
import { useSoundStore } from '@/hooks/useSoundStore';
import { useWeather } from '@/hooks/useWeather';
import type { BoardNote, BoardSettings, BoardWeatherLocation } from '@/types/board';
import { playFlap, primeBoardAudio } from '@/utils/boardSound';
import { BoardNotesPanel } from './BoardNotesPanel';
import { SplitFlapBoard } from './SplitFlapBoard';

// Prototype grid — will become a per-user setting later.
const ROWS = 6;
const COLS = 22;
const FLAP_SPEED_MS = 60;

const SpeakerIcon = ({ muted }: { muted: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M11 5 6 9H2v6h4l5 4V5z" strokeLinejoin="round" strokeLinecap="round" />
    {muted ? (
      <path d="M22 9l-6 6M16 9l6 6" strokeLinecap="round" />
    ) : (
      <>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
        <path d="M18.5 6a9 9 0 0 1 0 12" strokeLinecap="round" />
      </>
    )}
  </svg>
);

export const BoardDisplay = () => {
  const muted = useSoundStore(state => state.muted);
  const toggleMuted = useSoundStore(state => state.toggleMuted);
  const hydrate = useSoundStore(state => state.hydrate);

  const [settings, setSettings] = useState<BoardSettings | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);
  const [notes, setNotes] = useState<BoardNote[]>([]);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const loadNotes = useCallback(async () => {
    const list = await getBoardNotes();
    setNotes(list ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [loadedSettings, loadedNotes] = await Promise.all([getBoardSettings(), getBoardNotes()]);
      if (!active) return;
      setSettings(loadedSettings ?? {});
      setNotes(loadedNotes ?? []);
      setSettingsReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist a freshly geolocated location to Firebase so the Roku client (and next
  // visit) can render weather without re-prompting for location.
  const handleResolveLocation = useCallback((location: BoardWeatherLocation) => {
    setSettings(prev => ({ ...(prev ?? {}), weather: location }));
    void updateBoardSettings({ weather: location });
  }, []);

  const { weather, status: weatherStatus } = useWeather({
    savedLocation: settings?.weather ?? null,
    ready: settingsReady,
    onResolveLocation: handleResolveLocation
  });

  const { grid, scene } = useBoardRotation({ rows: ROWS, cols: COLS, notes, weather, weatherStatus });

  const handleToggleSound = () => {
    const enabling = muted;
    toggleMuted();
    if (enabling) {
      primeBoardAudio();
      playFlap();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="flex w-full items-center justify-between px-2" style={{ maxWidth: 'min(96vw, 1080px)' }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Board</h1>
          <p className="text-xs uppercase tracking-widest text-neutral-500">{scene.kind}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes(v => !v)}
            aria-pressed={showNotes}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 transition-colors hover:bg-white/10"
          >
            {showNotes ? 'Close notes' : 'Manage notes'}
          </button>
          <button
            type="button"
            onClick={handleToggleSound}
            aria-pressed={!muted}
            aria-label={muted ? 'Unmute flap sound' : 'Mute flap sound'}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-200 transition-colors hover:bg-white/10"
          >
            <SpeakerIcon muted={muted} />
            {muted ? 'Sound off' : 'Sound on'}
          </button>
        </div>
      </div>

      <SplitFlapBoard grid={grid} flapSpeedMs={FLAP_SPEED_MS} />

      {showNotes && <BoardNotesPanel notes={notes} onChange={loadNotes} />}

      <p className="px-4 text-center text-xs text-neutral-500">
        {muted ? 'Tap “Sound off” to hear the flaps.' : 'Rotating through clock, weather and your notes.'}
      </p>
    </div>
  );
};
