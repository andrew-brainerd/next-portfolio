import type { UpcomingAddon } from '@/types/addons';

export const CURSEFORGE_PROFILE_URL = 'https://www.curseforge.com/members/sp1d3rm0nk3yz/projects';

// Remove an entry once it's published and its project ID is added to brainerd-api's constants/curseforge.ts.
export const UPCOMING_ADDONS: UpcomingAddon[] = [
  {
    name: 'Lay of the Land',
    summary:
      'Shows the suggested level right under the zone name whenever you enter a zone or subzone, so you know whether Fargodeep Mine is for you before the kobolds decide.',
    logo: '/addons/lay-of-the-land.png'
  },
  {
    name: 'True Colors',
    summary:
      'Colors your cast bar by spell school: ice blue for Frostbolt, fiery red for Fireball, violet for Shadow Bolt. Everything else stays pure Blizzard.',
    logo: '/addons/true-colors.png'
  },
  {
    name: 'Charter Forever',
    summary:
      "Your guild's roster, gear and professions for WoW: Forever, shared between guildmates in game and, optionally, on a guild web page."
  }
];
