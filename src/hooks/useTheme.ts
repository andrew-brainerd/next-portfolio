import { create } from 'zustand';

export type ThemeName = 'ocean' | 'sunset' | 'forest' | 'lavender';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  primary: string;
  secondary: string;
  tertiary: string;
}

export const themes: ThemeConfig[] = [
  { name: 'ocean', label: 'Ocean', primary: '#217efd', secondary: '#84afea', tertiary: '#00429b' },
  { name: 'sunset', label: 'Sunset', primary: '#f97316', secondary: '#fdba74', tertiary: '#c2410c' },
  { name: 'forest', label: 'Forest', primary: '#22c55e', secondary: '#86efac', tertiary: '#15803d' },
  { name: 'lavender', label: 'Lavender', primary: '#a855f7', secondary: '#d8b4fe', tertiary: '#7e22ce' }
];

const THEME_STORAGE_KEY = 'theme';

interface ThemeStore {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  initializeTheme: () => void;
}

export const useTheme = create<ThemeStore>(set => ({
  theme: 'ocean',
  setTheme: theme => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    set({ theme });
  },
  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
      const theme = stored && themes.some(t => t.name === stored) ? stored : 'ocean';
      document.documentElement.setAttribute('data-theme', theme);
      set({ theme });
    }
  }
}));
