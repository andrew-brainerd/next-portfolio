import { describe, it, expect } from 'vitest';
import {
  downloadFor,
  formatBytes,
  formatReleaseDate,
  normalizeReleaseManifest,
  releaseManifestUrl
} from './apps';

describe('releaseManifestUrl', () => {
  it('builds the S3 manifest URL from a slug', () => {
    expect(releaseManifestUrl('condensate')).toBe(
      'https://brainerd.s3.us-east-1.amazonaws.com/condensate/latest.json'
    );
  });
});

describe('normalizeReleaseManifest', () => {
  const valid = {
    version: '0.4.1',
    releasedAt: '2026-05-18',
    notes: 'First public build',
    downloads: [
      {
        platform: 'macos',
        label: 'macOS — Apple Silicon & Intel',
        url: 'https://example.com/Condensate_0.4.1_universal.dmg',
        sizeBytes: 12_582_912
      },
      { platform: 'windows', url: 'https://example.com/Condensate_0.4.1_x64-setup.exe' }
    ]
  };

  it('normalizes a well-formed manifest', () => {
    const result = normalizeReleaseManifest(valid);
    expect(result).toEqual({
      version: '0.4.1',
      releasedAt: '2026-05-18',
      notes: 'First public build',
      downloads: [
        {
          platform: 'macos',
          label: 'macOS — Apple Silicon & Intel',
          url: 'https://example.com/Condensate_0.4.1_universal.dmg',
          sizeBytes: 12_582_912
        },
        {
          platform: 'windows',
          label: 'Windows',
          url: 'https://example.com/Condensate_0.4.1_x64-setup.exe'
        }
      ]
    });
  });

  it('falls back to a default label when one is missing', () => {
    const result = normalizeReleaseManifest({
      version: '1.0.0',
      downloads: [{ platform: 'macos', url: 'https://example.com/app.dmg' }]
    });
    expect(result?.downloads[0].label).toBe('macOS');
  });

  it('drops downloads with unknown platforms or missing urls', () => {
    const result = normalizeReleaseManifest({
      version: '1.0.0',
      downloads: [
        { platform: 'linux', url: 'https://example.com/app.AppImage' },
        { platform: 'macos' },
        { platform: 'windows', url: 'https://example.com/app.exe' }
      ]
    });
    expect(result?.downloads).toHaveLength(1);
    expect(result?.downloads[0].platform).toBe('windows');
  });

  it('returns null when there is no usable version', () => {
    expect(normalizeReleaseManifest({ downloads: valid.downloads })).toBeNull();
    expect(normalizeReleaseManifest({ version: '   ', downloads: valid.downloads })).toBeNull();
  });

  it('returns null when there are no valid downloads', () => {
    expect(normalizeReleaseManifest({ version: '1.0.0', downloads: [] })).toBeNull();
    expect(normalizeReleaseManifest({ version: '1.0.0' })).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(normalizeReleaseManifest(null)).toBeNull();
    expect(normalizeReleaseManifest('nope')).toBeNull();
    expect(normalizeReleaseManifest(undefined)).toBeNull();
  });

  it('ignores an invalid releasedAt but keeps the rest', () => {
    const result = normalizeReleaseManifest({
      version: '1.0.0',
      releasedAt: 'not-a-date',
      downloads: [{ platform: 'macos', url: 'https://example.com/app.dmg' }]
    });
    expect(result?.releasedAt).toBeUndefined();
    expect(result?.version).toBe('1.0.0');
  });
});

describe('downloadFor', () => {
  const manifest = normalizeReleaseManifest({
    version: '1.0.0',
    downloads: [
      { platform: 'macos', url: 'https://example.com/app.dmg' },
      { platform: 'windows', url: 'https://example.com/app.exe' }
    ]
  })!;

  it('finds the download for a platform', () => {
    expect(downloadFor(manifest, 'windows')?.url).toBe('https://example.com/app.exe');
  });

  it('returns undefined when the platform is absent', () => {
    const macOnly = normalizeReleaseManifest({
      version: '1.0.0',
      downloads: [{ platform: 'macos', url: 'https://example.com/app.dmg' }]
    })!;
    expect(downloadFor(macOnly, 'windows')).toBeUndefined();
  });
});

describe('formatBytes', () => {
  it('formats byte counts with sensible precision', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(12_582_912)).toBe('12 MB');
    expect(formatBytes(1_572_864)).toBe('1.5 MB');
    expect(formatBytes(3_221_225_472)).toBe('3 GB');
  });

  it('returns an empty string for non-positive or invalid input', () => {
    expect(formatBytes(0)).toBe('');
    expect(formatBytes(-10)).toBe('');
    expect(formatBytes(Number.NaN)).toBe('');
  });
});

describe('formatReleaseDate', () => {
  it('formats an ISO date for display', () => {
    expect(formatReleaseDate('2026-05-18')).toBe('May 18, 2026');
  });

  it('returns null for missing or invalid dates', () => {
    expect(formatReleaseDate(undefined)).toBeNull();
    expect(formatReleaseDate('not-a-date')).toBeNull();
  });
});
