import { describe, it, expect } from 'vitest';
import { buildImageUrl, selectSteamGames, steamPageHref } from './steam';

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
    expect(buildImageUrl(440, '')).toBe('https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png');
  });
});

describe('selectSteamGames', () => {
  const games = [
    { appid: 1, playtime_forever: 60 },
    { appid: 2, playtime_forever: 600 },
    { appid: 3, playtime_forever: 0 },
    { appid: 4, playtime_forever: 300 }
  ];

  it('keeps games over the playtime floor, most played first', () => {
    expect(selectSteamGames(games, { hiddenAppIds: [], minimumHours: 2 }).map(g => g.appid)).toEqual([2, 4]);
  });

  it('drops hidden games', () => {
    expect(selectSteamGames(games, { hiddenAppIds: [2], minimumHours: 2 }).map(g => g.appid)).toEqual([4]);
  });

  it('keeps only Deck 60fps games regardless of playtime in Deck mode', () => {
    expect(
      selectSteamGames(games, { hiddenAppIds: [], minimumHours: 2, deck60AppIds: [1, 3, 4] }).map(g => g.appid)
    ).toEqual([4, 1, 3]);
  });
});

describe('steamPageHref', () => {
  it('links to the plain library by default', () => {
    expect(steamPageHref({ deck60: false })).toBe('/steam');
  });

  it('keeps the viewed Steam ID when toggling Deck mode', () => {
    expect(steamPageHref({ steamId: '123', deck60: true })).toBe('/steam?steamId=123&deck60=true');
  });
});
