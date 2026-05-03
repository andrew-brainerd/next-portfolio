import { create } from 'zustand';
import { registerMutedAccessor } from '@/utils/rollWithMeSound';

const STORAGE_KEY = 'roll-with-me:sound';

interface SoundStore {
  muted: boolean;
  hydrated: boolean;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  hydrate: () => void;
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  muted: true,
  hydrated: false,
  setMuted: muted => {
    set({ muted });
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, muted ? 'off' : 'on');
      } catch {
        // localStorage may be unavailable (private mode etc.) — ignore
      }
    }
  },
  toggleMuted: () => get().setMuted(!get().muted),
  hydrate: () => {
    if (typeof window === 'undefined' || get().hydrated) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      set({ muted: stored !== 'on', hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  }
}));

registerMutedAccessor(() => useSoundStore.getState().muted);
