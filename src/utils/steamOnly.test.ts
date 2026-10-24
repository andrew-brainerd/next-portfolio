import { describe, expect, it } from 'vitest';

import { cookieUid, isSteamOnlyUid, steamOnlyAllows } from './steamOnly';

describe('Steam-only accounts', () => {
  it('are Steam uids only', () => {
    expect(isSteamOnlyUid('steam:76561197960287930')).toBe(true);
    expect(isSteamOnlyUid('abc123')).toBe(false);
    expect(isSteamOnlyUid(undefined)).toBe(false);
  });

  it('may use Condensate, downloads, device linking, sign-in and settings only', () => {
    for (const path of [
      '/condensate',
      '/condensate/polls/abc',
      '/apps/condensate',
      '/link',
      '/login/steam',
      '/settings'
    ]) {
      expect(steamOnlyAllows(path)).toBe(true);
    }
    for (const path of ['/', '/manga', '/watch', '/scorebook/frisbee-golf', '/linker', '/condensates']) {
      expect(steamOnlyAllows(path)).toBe(false);
    }
  });

  it('reads an encoded uid cookie', () => {
    expect(cookieUid('steam%3A76561197960287930')).toBe('steam:76561197960287930');
    expect(cookieUid('abc')).toBe('abc');
    expect(cookieUid('%E0%A4%A')).toBe('%E0%A4%A');
    expect(cookieUid(undefined)).toBeUndefined();
  });
});
