import Link from 'next/link';
import { HOME_SECTIONS } from '@/constants/homeLinks';
import type { HomeLinkItem } from '@/types/home';
import { opensInNewTab, visibleSections } from '@/utils/home';

const ICON_CLASS = 'h-8 w-8 fill-black text-black';

const Shortcut = ({ name, path, Icon }: HomeLinkItem) => {
  const newTab = opensInNewTab(path);
  const content = (
    <>
      <Icon className={ICON_CLASS} aria-hidden="true" />
      <span className="win95-desktop-icon-label">{name}</span>
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );

  if (path.startsWith('/')) {
    return (
      <Link className="win95-desktop-icon win95-focusable" href={path}>
        {content}
      </Link>
    );
  }

  return (
    <a
      className="win95-desktop-icon win95-focusable"
      href={path}
      {...(newTab && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {content}
    </a>
  );
};

interface Win95HomeProps {
  isLoggedIn: boolean;
}

export const Win95Home = ({ isLoggedIn }: Win95HomeProps) => (
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

    {visibleSections(HOME_SECTIONS, isLoggedIn).map(section => (
      <section key={section.id} aria-labelledby={`win95-home-${section.id}`} className="mb-3">
        <h2 id={`win95-home-${section.id}`} className="mb-1 font-bold">
          {section.label}
        </h2>
        <div className="flex flex-wrap gap-1">
          {section.links.map(link => (
            <Shortcut key={link.path} {...link} />
          ))}
        </div>
      </section>
    ))}
  </div>
);
