'use client';

import { themes, useTheme, type ThemeName } from 'hooks/useTheme';
import { useWin95Mode } from 'hooks/useWin95Mode';

// Windows 95 mode is presented as one more option alongside the color schemes,
// even though it's a separate (structural) mode rather than a palette swap.
export const WIN95_OPTION_ID = 'win95';

export interface ThemeOption {
  id: string;
  label: string;
  swatches: string[];
}

export const themeOptions: ThemeOption[] = [
  ...themes.map(theme => ({
    id: theme.name,
    label: theme.label,
    swatches: [theme.primary, theme.secondary, theme.tertiary]
  })),
  { id: WIN95_OPTION_ID, label: 'Windows 95', swatches: ['#c0c0c0', '#000080', '#008080'] }
];

interface ThemeSelection {
  options: ThemeOption[];
  activeId: string;
  select: (id: string) => void;
}

// Single source of truth for the unified theme picker (color schemes + Win95 mode).
// Shared by the Settings hub (`ThemeSelector`) and the Win95 Control Panel so they
// can never drift apart.
export const useThemeSelection = (): ThemeSelection => {
  const { theme: current, setTheme } = useTheme();
  const { enabled: win95, enable: enableWin95, disable: disableWin95 } = useWin95Mode();

  const activeId = win95 ? WIN95_OPTION_ID : current;

  const select = (id: string) => {
    if (id === WIN95_OPTION_ID) {
      enableWin95();
    } else {
      if (win95) disableWin95();
      setTheme(id as ThemeName);
    }
  };

  return { options: themeOptions, activeId, select };
};
