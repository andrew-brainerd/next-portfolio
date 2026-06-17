import { create } from 'zustand';

const WIN95_STORAGE_KEY = 'win95Mode';
const WIN95_MODE_ATTRIBUTE = 'win95';

const applyMode = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  if (enabled) {
    document.documentElement.setAttribute('data-mode', WIN95_MODE_ATTRIBUTE);
    localStorage.setItem(WIN95_STORAGE_KEY, '1');
  } else {
    document.documentElement.removeAttribute('data-mode');
    localStorage.removeItem(WIN95_STORAGE_KEY);
  }
};

interface Win95ModeStore {
  enabled: boolean;
  hydrated: boolean;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  initialize: () => void;
}

export const useWin95Mode = create<Win95ModeStore>((set, get) => ({
  enabled: false,
  hydrated: false,
  enable: () => {
    applyMode(true);
    set({ enabled: true });
  },
  disable: () => {
    applyMode(false);
    set({ enabled: false });
  },
  toggle: () => {
    const next = !get().enabled;
    applyMode(next);
    set({ enabled: next });
  },
  initialize: () => {
    if (typeof window === 'undefined') return;
    // The inline head script has already set data-mode before paint; trust the DOM.
    const enabled = document.documentElement.getAttribute('data-mode') === WIN95_MODE_ATTRIBUTE;
    set({ enabled, hydrated: true });
  }
}));
