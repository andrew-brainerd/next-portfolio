import Link from 'next/link';
import type { ComponentType, SVGAttributes } from 'react';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LinkedinIcon } from '@/components/icons/LinkedinIcon';
import { MailIcon } from '@/components/icons/MailIcon';
import { SteamIcon } from '@/components/icons/SteamIcon';
import { PeapodIcon } from '@/components/icons/PeapodIcon';
import { RollWithMeIcon } from '@/components/icons/RollWithMeIcon';
import { CondensateIcon } from '@/components/icons/CondensateIcon';

type IconComponent = ComponentType<SVGAttributes<SVGElement>>;

interface DesktopShortcut {
  name: string;
  path: string;
  external: boolean;
  Icon: IconComponent;
}

interface ShortcutGroup {
  label: string;
  items: DesktopShortcut[];
}

const GROUPS: ShortcutGroup[] = [
  {
    label: 'Work',
    items: [
      { name: 'GitHub', path: 'https://github.com/andrew-brainerd', external: true, Icon: GitHubIcon },
      {
        name: 'LinkedIn',
        path: 'https://www.linkedin.com/in/andrewbrainerd3',
        external: true,
        Icon: LinkedinIcon
      },
      { name: 'Email', path: 'mailto:andrew@brainerd.dev', external: true, Icon: MailIcon }
    ]
  },
  {
    label: 'Apps',
    items: [{ name: 'Condensate', path: '/apps/condensate', external: false, Icon: CondensateIcon }]
  },
  {
    label: 'Play',
    items: [
      { name: 'Steam', path: '/steam', external: false, Icon: SteamIcon },
      { name: 'Peapod', path: '/peapod', external: false, Icon: PeapodIcon },
      { name: 'Roll With Me', path: '/roll-with-me', external: false, Icon: RollWithMeIcon }
    ]
  }
];

const ICON_CLASS = 'h-8 w-8 fill-black text-black';

const Shortcut = ({ name, path, external, Icon }: DesktopShortcut) => {
  const content = (
    <>
      <Icon className={ICON_CLASS} aria-hidden="true" />
      <span className="win95-desktop-icon-label">{name}</span>
    </>
  );

  if (external) {
    return (
      <a
        className="win95-desktop-icon"
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={name}
      >
        {content}
      </a>
    );
  }

  return (
    <Link className="win95-desktop-icon" href={path} aria-label={name}>
      {content}
    </Link>
  );
};

export const Win95Home = () => (
  <div className="p-3">
    <div className="win95-raised mb-4 flex items-center gap-3 p-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#000080] text-2xl font-bold text-white">
        AB
      </div>
      <div>
        <div className="text-base font-bold">Andrew J. Brainerd</div>
        <div className="text-[11px]">Software Engineer &amp; Pretty Nice Guy</div>
      </div>
    </div>

    {GROUPS.map(group => (
      <div key={group.label} className="mb-3">
        <div className="mb-1 font-bold">{group.label}</div>
        <div className="flex flex-wrap gap-1">
          {group.items.map(item => (
            <Shortcut key={item.name} {...item} />
          ))}
        </div>
      </div>
    ))}
  </div>
);
