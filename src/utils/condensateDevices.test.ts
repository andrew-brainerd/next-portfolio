import { describe, expect, it } from 'vitest';

import { deviceTitle, lastUsedLabel } from './condensateDevices';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 100 * DAY;

describe('Condensate device list labels', () => {
  it('names a device by what it reported', () => {
    expect(deviceTitle({ id: '1', createdAt: 0, name: 'steamdeck', platform: 'linux' })).toBe('steamdeck (Linux)');
    expect(deviceTitle({ id: '1', createdAt: 0, name: 'DESKTOP-1' })).toBe('DESKTOP-1');
    expect(deviceTitle({ id: '1', createdAt: 0, platform: 'windows' })).toBe('Windows device');
    expect(deviceTitle({ id: '1', createdAt: 0 })).toBe('Condensate device');
  });

  it('says when it was last used, or when it signed in if never', () => {
    expect(lastUsedLabel({ id: '1', createdAt: NOW - 10 * DAY, lastUsedAt: NOW - 1000 }, NOW)).toBe('Last used today');
    expect(lastUsedLabel({ id: '1', createdAt: 0, lastUsedAt: NOW - DAY }, NOW)).toBe('Last used yesterday');
    expect(lastUsedLabel({ id: '1', createdAt: NOW - 3 * DAY }, NOW)).toBe('Signed in 3 days ago');
  });
});
