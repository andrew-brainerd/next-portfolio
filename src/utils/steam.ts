export const buildImageUrl = (appId: number | string, hash: string): string =>
  hash
    ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`
    : 'https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png';

export const steamCoverArt = (appId: number): string =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;

// Alphabetical, ignoring a leading "The" so The Witcher files under W.
export const sortGamesByName = <T extends { name: string }>(games: T[]): T[] => {
  const sortKey = (name: string) => name.replace(/^the\s+/i, '');
  return [...games].sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), 'en', { sensitivity: 'base' }));
};
