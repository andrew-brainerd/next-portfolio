import { describe, it, expect } from 'vitest';
import { buildImageUrl } from './steam';

describe('buildImageUrl', () => {
  it('builds a Steam media URL when given a hash', () => {
    expect(buildImageUrl(440, 'abc123')).toBe(
      'https://media.steampowered.com/steamcommunity/public/images/apps/440/abc123.jpg'
    );
  });

  it('accepts string appIds', () => {
    expect(buildImageUrl('730', 'xyz')).toBe(
      'https://media.steampowered.com/steamcommunity/public/images/apps/730/xyz.jpg'
    );
  });

  it('falls back to the Steam logo when the hash is empty', () => {
    expect(buildImageUrl(440, '')).toBe(
      'https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png'
    );
  });
});
