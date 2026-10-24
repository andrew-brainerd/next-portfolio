import { AddonsIcon } from '@/components/icons/AddonsIcon';
import { CondensateIcon } from '@/components/icons/CondensateIcon';
import { DownloadAllIcon } from '@/components/icons/DownloadAllIcon';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LinkedinIcon } from '@/components/icons/LinkedinIcon';
import { MailIcon } from '@/components/icons/MailIcon';
import { PeapodIcon } from '@/components/icons/PeapodIcon';
import { RollWithMeIcon } from '@/components/icons/RollWithMeIcon';
import { ScorebookIcon } from '@/components/icons/ScorebookIcon';
import { SteamIcon } from '@/components/icons/SteamIcon';
import {
  ADDONS_ROUTE,
  APPS_CONDENSATE_ROUTE,
  APPS_DOWNLOAD_ALL_ROUTE,
  PEAPOD_ROUTE,
  ROLL_WITH_ME_ROUTE,
  SCOREBOOK_ROUTE
} from '@/constants/routes';
import type { HomeSection } from '@/types/home';

/** Every homepage link, shared by the normal and Win95 homepages. */
export const HOME_SECTIONS: HomeSection[] = [
  {
    id: 'work',
    label: 'Work',
    description: 'Connect with me professionally and explore my work',
    links: [
      {
        name: 'GitHub',
        description: 'Code and side projects',
        path: 'https://github.com/andrew-brainerd',
        Icon: GitHubIcon
      },
      {
        name: 'LinkedIn',
        description: 'Experience and background',
        path: 'https://www.linkedin.com/in/andrewbrainerd3',
        Icon: LinkedinIcon
      },
      { name: 'Email', description: 'andrew@brainerd.dev', path: 'mailto:andrew@brainerd.dev', Icon: MailIcon }
    ]
  },
  {
    id: 'apps',
    label: 'Apps',
    description: "Native desktop apps I've built for macOS and Windows",
    links: [
      {
        name: 'Condensate',
        description: 'Plan game night with your Steam friends',
        path: APPS_CONDENSATE_ROUTE,
        Icon: CondensateIcon
      },
      {
        name: 'Download All',
        description: 'Start every pending Steam update at once',
        path: APPS_DOWNLOAD_ALL_ROUTE,
        Icon: DownloadAllIcon
      }
    ]
  },
  {
    id: 'play',
    label: 'Play',
    description: 'Gaming stats, music pods, WoW addons, and an async multiplayer dice game',
    links: [
      { name: 'Steam Stats', description: 'My gaming library and playtime', path: '/steam', Icon: SteamIcon },
      { name: 'Peapod', description: 'Listen to Spotify together', path: PEAPOD_ROUTE, Icon: PeapodIcon },
      {
        name: 'Roll With Me',
        description: 'Async multiplayer dice game',
        path: ROLL_WITH_ME_ROUTE,
        Icon: RollWithMeIcon
      },
      { name: 'WoW Addons', description: 'Addons I publish on CurseForge', path: ADDONS_ROUTE, Icon: AddonsIcon },
      {
        name: 'Scorebook',
        description: 'Frisbee golf scores and stats',
        path: SCOREBOOK_ROUTE,
        Icon: ScorebookIcon,
        requiresLogin: true
      }
    ]
  }
];
