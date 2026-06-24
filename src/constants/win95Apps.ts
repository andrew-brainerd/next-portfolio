import { Win95App } from '@/types/win95';

// Curated "applications" surfaced in the Start menu while Win95 mode is on.
// Non-listed routes still work; they just inherit the shell without a Start entry.
export const WIN95_APPS: Win95App[] = [
  { id: 'portfolio', label: 'My Portfolio', route: '/' },
  { id: 'steam', label: 'Steam', route: '/steam' },
  { id: 'peapod', label: 'Peapod', route: '/peapod' },
  { id: 'control-panel', label: 'Control Panel', route: '/appearance' }
];

export const WIN95_DEFAULT_TITLE = 'Andrew Brainerd';
