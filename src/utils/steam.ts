export const buildImageUrl = (appId: number | string, hash: string) => hash ?
  `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg` : 'https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png';
