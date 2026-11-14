import { describe, expect, it } from 'vitest';
import { downloadsByVersion, normalizeDownloadCounts } from './condensateDownloadCounts';

describe('normalizeDownloadCounts', () => {
  it('keeps valid rows and zero-fills missing sources', () => {
    expect(
      normalizeDownloadCounts({
        bySource: { site: 4, updater: 'x' },
        byVersion: [
          { version: '0.6.2', platform: 'windows', source: 'site', count: 4 },
          { version: '0.6.2', platform: 'android', source: 'site', count: 1 },
          { version: '0.6.1', platform: 'macos', source: 'bogus', count: 1 },
          { version: '0.6.0', platform: 'macos', source: 'site', count: -1 },
          null
        ]
      })
    ).toEqual({
      bySource: { site: 4, updater: 0, direct: 0 },
      byVersion: [{ version: '0.6.2', platform: 'windows', source: 'site', count: 4 }]
    });
  });

  it('returns null without counts', () => {
    expect(normalizeDownloadCounts(undefined)).toBeNull();
    expect(normalizeDownloadCounts({ bySource: {} })).toBeNull();
  });
});

describe('downloadsByVersion', () => {
  it('adds platforms together per version, keeping order', () => {
    expect(
      downloadsByVersion({
        bySource: { site: 6, updater: 2, direct: 1 },
        byVersion: [
          { version: '0.6.2', platform: 'windows', source: 'site', count: 3 },
          { version: '0.6.2', platform: 'macos', source: 'site', count: 2 },
          { version: '0.6.2', platform: 'windows', source: 'updater', count: 2 },
          { version: '0.6.0', platform: 'windows', source: 'site', count: 1 },
          { version: '0.6.0', platform: 'linux', source: 'direct', count: 1 }
        ]
      })
    ).toEqual([
      { version: '0.6.2', site: 5, updater: 2, direct: 0 },
      { version: '0.6.0', site: 1, updater: 0, direct: 1 }
    ]);
  });
});
