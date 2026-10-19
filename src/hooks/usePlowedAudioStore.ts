import { create } from 'zustand';
import { registerPlowedSfxMutedAccessor } from '@/utils/plowedSound';

const SFX_KEY = 'plowed:sfx';

interface PlowedAudioStore {
  sfxMuted: boolean;
  hydrated: boolean;
  toggleSfx: () => void;
  hydrate: () => void;
}

export const usePlowedAudioStore = create<PlowedAudioStore>((set, get) => ({
  sfxMuted: false,
  hydrated: false,
  toggleSfx: () => {
    const sfxMuted = !get().sfxMuted;
    set({ sfxMuted });
    try {
      window.localStorage.setItem(SFX_KEY, sfxMuted ? 'off' : 'on');
    } catch {
      // Storage unavailable (private mode); the setting just won't persist.
    }
  },
  hydrate: () => {
    if (typeof window === 'undefined' || get().hydrated) return;
    try {
      set({ sfxMuted: window.localStorage.getItem(SFX_KEY) === 'off', hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  }
}));

registerPlowedSfxMutedAccessor(() => usePlowedAudioStore.getState().sfxMuted);
