import { describe, it, expect } from 'vitest';
import { win95AppForPath, formatWin95Clock } from '@/utils/win95';
import { Win95App } from '@/types/win95';

const apps: Win95App[] = [
  { id: 'portfolio', label: 'My Portfolio', route: '/' },
  { id: 'steam', label: 'Steam', route: '/steam' },
  { id: 'control-panel', label: 'Control Panel', route: '/appearance' }
];

describe('win95AppForPath', () => {
  it('matches an exact route', () => {
    expect(win95AppForPath('/steam', apps)?.id).toBe('steam');
  });

  it('matches the root route only exactly', () => {
    expect(win95AppForPath('/', apps)?.id).toBe('portfolio');
  });

  it('matches a nested path by route prefix', () => {
    expect(win95AppForPath('/steam/12345', apps)?.id).toBe('steam');
  });

  it('does not treat root as a prefix for arbitrary paths', () => {
    expect(win95AppForPath('/manga', apps)).toBeUndefined();
  });

  it('prefers the deepest matching route', () => {
    const nested: Win95App[] = [
      { id: 'a', label: 'A', route: '/steam' },
      { id: 'b', label: 'B', route: '/steam/library' }
    ];
    expect(win95AppForPath('/steam/library/9', nested)?.id).toBe('b');
  });
});

describe('formatWin95Clock', () => {
  it('formats as 12-hour time with meridiem', () => {
    expect(formatWin95Clock(new Date('2026-06-16T13:05:00'))).toBe('1:05 PM');
  });

  it('formats midnight as 12 AM', () => {
    expect(formatWin95Clock(new Date('2026-06-16T00:00:00'))).toBe('12:00 AM');
  });
});
