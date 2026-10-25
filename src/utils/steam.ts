export const buildImageUrl = (appId: number | string, hash: string): string =>
  hash
    ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`
    : 'https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png';

interface SelectSteamGamesOptions {
  hiddenAppIds: number[];
  minimumHours: number;
  deck60AppIds?: number[];
}

// Deck 60fps mode searches the whole library, so it skips the playtime floor.
export const selectSteamGames = <T extends { appid: number; playtime_forever?: number }>(
  games: T[],
  { hiddenAppIds, minimumHours, deck60AppIds }: SelectSteamGamesOptions
): T[] =>
  games
    .filter(game => !hiddenAppIds.includes(game.appid))
    .filter(game =>
      deck60AppIds ? deck60AppIds.includes(game.appid) : (game.playtime_forever || 0) / 60 > minimumHours
    )
    .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0));

export const steamPageHref = ({ steamId, deck60 }: { steamId?: string; deck60: boolean }): string => {
  const params = new URLSearchParams();
  if (steamId) params.set('steamId', steamId);
  if (deck60) params.set('deck60', 'true');
  const query = params.toString();
  return query ? `/steam?${query}` : '/steam';
};
