import type { UpcomingAddon } from '@/types/addons';

export const CURSEFORGE_PROFILE_URL = 'https://www.curseforge.com/members/sp1d3rm0nk3yz/projects';

// Remove an entry once it's published and its project ID is added to brainerd-api's constants/curseforge.ts.
export const UPCOMING_ADDONS: UpcomingAddon[] = [
  {
    name: 'Sound and Fury',
    summary:
      'Give your wand a new voice: swap its shot sound for a laser pew, a pocket thunderclap, a rubber duck and more. Hover to hear, click to choose.',
    logo: '/addons/sound-and-fury.png'
  },
  {
    name: 'Charter Forever',
    summary:
      "Your guild's roster, gear and professions for WoW: Forever, shared between guildmates in game and, optionally, on a guild web page."
  }
];
