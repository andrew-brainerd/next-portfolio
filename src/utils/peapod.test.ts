import { describe, it, expect } from 'vitest';
import type { SpotifyTrack, SpotifyDevice } from '@/types/peapod';
import {
  deduplicateByKey,
  getAlbumArtUrl,
  formatArtistNames,
  scoreMatch,
  sortDevicesWithPeapodFirst,
  deduplicateHistory,
  buildSearchResults
} from './peapod';

const makeTrack = (uri: string, name: string, artistName = 'Artist'): SpotifyTrack => ({
  uri,
  name,
  artists: [{ name: artistName }],
  album: {
    images: [
      { url: `${name}-large.jpg`, height: 640, width: 640 },
      { url: `${name}-medium.jpg`, height: 300, width: 300 },
      { url: `${name}-small.jpg`, height: 64, width: 64 }
    ]
  },
  duration_ms: 200000,
  preview_url: null
});

const makeDevice = (name: string, isActive = false): SpotifyDevice => ({
  id: name.toLowerCase().replace(/\s/g, '-'),
  name,
  is_active: isActive,
  is_restricted: false,
  type: 'Computer'
});

describe('deduplicateByKey', () => {
  it('removes duplicates keeping the last occurrence', () => {
    const items = [
      { id: '1', name: 'a' },
      { id: '2', name: 'b' },
      { id: '1', name: 'a-updated' }
    ];
    const result = deduplicateByKey(items, i => i.id);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('a-updated');
    expect(result[1].name).toBe('b');
  });

  it('returns empty array for empty input', () => {
    expect(deduplicateByKey([], i => String(i))).toEqual([]);
  });
});

describe('getAlbumArtUrl', () => {
  it('returns the smallest image (index 2) when available', () => {
    const track = makeTrack('uri:1', 'Song');
    expect(getAlbumArtUrl(track)).toBe('Song-small.jpg');
  });

  it('falls back to the first image when index 2 is missing', () => {
    const track = makeTrack('uri:1', 'Song');
    track.album.images = [{ url: 'only-large.jpg', height: 640, width: 640 }];
    expect(getAlbumArtUrl(track)).toBe('only-large.jpg');
  });

  it('returns undefined when no images exist', () => {
    const track = makeTrack('uri:1', 'Song');
    track.album.images = [];
    expect(getAlbumArtUrl(track)).toBeUndefined();
  });
});

describe('formatArtistNames', () => {
  it('joins multiple artist names with commas', () => {
    expect(formatArtistNames([{ name: 'Alice' }, { name: 'Bob' }])).toBe('Alice, Bob');
  });

  it('returns single artist name', () => {
    expect(formatArtistNames([{ name: 'Alice' }])).toBe('Alice');
  });

  it('returns empty string for undefined', () => {
    expect(formatArtistNames(undefined)).toBe('');
  });

  it('returns empty string for empty array', () => {
    expect(formatArtistNames([])).toBe('');
  });
});

describe('scoreMatch', () => {
  it('scores exact match highest', () => {
    expect(scoreMatch('hello', 'hello', 0)).toBe(100);
  });

  it('scores startsWith match second', () => {
    expect(scoreMatch('hello world', 'hello', 0)).toBe(80);
  });

  it('scores includes match third', () => {
    expect(scoreMatch('say hello', 'hello', 0)).toBe(60);
  });

  it('gives lowest score for no match', () => {
    expect(scoreMatch('goodbye', 'hello', 0)).toBe(40);
  });

  it('penalizes by index', () => {
    expect(scoreMatch('hello', 'hello', 3)).toBe(97);
  });

  it('is case insensitive', () => {
    expect(scoreMatch('Hello', 'hello', 0)).toBe(100);
  });
});

describe('sortDevicesWithPeapodFirst', () => {
  it('puts Peapod Web Player first', () => {
    const devices = [makeDevice('iPhone'), makeDevice('Peapod Web Player'), makeDevice('MacBook')];
    const sorted = sortDevicesWithPeapodFirst(devices);
    expect(sorted[0].name).toBe('Peapod Web Player');
  });

  it('preserves order when no Peapod device', () => {
    const devices = [makeDevice('iPhone'), makeDevice('MacBook')];
    const sorted = sortDevicesWithPeapodFirst(devices);
    expect(sorted[0].name).toBe('iPhone');
    expect(sorted[1].name).toBe('MacBook');
  });

  it('does not mutate the original array', () => {
    const devices = [makeDevice('iPhone'), makeDevice('Peapod Web Player')];
    sortDevicesWithPeapodFirst(devices);
    expect(devices[0].name).toBe('iPhone');
  });
});

describe('deduplicateHistory', () => {
  it('keeps only the most recent play of each track', () => {
    const history = [makeTrack('uri:1', 'Song A'), makeTrack('uri:2', 'Song B'), makeTrack('uri:1', 'Song A')];
    const result = deduplicateHistory(history);
    expect(result).toHaveLength(2);
    expect(result[0].uri).toBe('uri:1');
    expect(result[1].uri).toBe('uri:2');
  });

  it('returns newest first', () => {
    const history = [makeTrack('uri:1', 'Old'), makeTrack('uri:2', 'New')];
    const result = deduplicateHistory(history);
    expect(result[0].uri).toBe('uri:2');
  });

  it('handles empty history', () => {
    expect(deduplicateHistory([])).toEqual([]);
  });
});

describe('buildSearchResults', () => {
  it('returns results sorted by relevance', () => {
    const data = {
      artists: { items: [{ id: 'a1', name: 'Exact Match', images: [] }] },
      albums: { items: [{ id: 'al1', name: 'Something Else', artists: [{ name: 'X' }], images: [] }] },
      tracks: { items: [makeTrack('uri:1', 'Exact Match')] }
    };
    const results = buildSearchResults(data, 'Exact Match');
    expect(results.length).toBe(3);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });

  it('handles empty data', () => {
    expect(buildSearchResults({}, 'test')).toEqual([]);
  });

  it('deduplicates tracks by name', () => {
    const data = {
      tracks: {
        items: [makeTrack('uri:1', 'Same Song'), makeTrack('uri:2', 'Same Song')]
      }
    };
    const results = buildSearchResults(data, 'Same Song');
    const tracks = results.filter(r => r.type === 'track');
    expect(tracks).toHaveLength(1);
  });
});
