'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import HomeLink from 'components/HomeLink';
import GitHubIcon from 'components/icons/GitHubIcon';
import LinkedinIcon from 'components/icons/LinkedinIcon';
import PeapodIcon from 'components/icons/PeapodIcon';
import MailIcon from 'components/icons/MailIcon';
import SteamIcon from 'components/icons/SteamIcon';
import RollWithMeIcon from 'components/icons/RollWithMeIcon';
import CondensateIcon from 'components/icons/CondensateIcon';

const TABS = [
  { id: 'work', label: 'Work', description: 'Connect with me professionally and explore my work' },
  { id: 'apps', label: 'Apps', description: "Native desktop apps I've built for macOS and Windows" },
  {
    id: 'play',
    label: 'Play',
    description: 'Explore my gaming stats, music pods, and experience tracker'
  }
] as const;

type TabId = (typeof TABS)[number]['id'];

const ICON_CLASS = 'fill-white h-14 w-14 sm:h-18 sm:w-18';

function linksFor(id: TabId): ReactNode {
  if (id === 'work') {
    return (
      <>
        <HomeLink name="GitHub Profile" path="https://github.com/andrew-brainerd">
          <GitHubIcon className={ICON_CLASS} aria-hidden="true" />
        </HomeLink>
        <HomeLink name="LinkedIn Profile" path="https://www.linkedin.com/in/andrewbrainerd3">
          <LinkedinIcon className={ICON_CLASS} aria-hidden="true" />
        </HomeLink>
        <HomeLink name="Send Email" path="mailto:andrew@brainerd.dev">
          <MailIcon className={ICON_CLASS} aria-hidden="true" />
        </HomeLink>
      </>
    );
  }

  if (id === 'apps') {
    return (
      <HomeLink name="Condensate" path="/apps/condensate" openNewTab={false}>
        <CondensateIcon className={ICON_CLASS} aria-hidden="true" />
      </HomeLink>
    );
  }

  return (
    <>
      <HomeLink name="Steam Gaming Stats" path="/steam" openNewTab={false}>
        <SteamIcon className={ICON_CLASS} aria-hidden="true" />
      </HomeLink>
      <HomeLink name="Peapod" path="/peapod" openNewTab={false}>
        <PeapodIcon className={ICON_CLASS} aria-hidden="true" />
      </HomeLink>
      <HomeLink name="Roll With Me" path="/roll-with-me" openNewTab={false}>
        <RollWithMeIcon className={ICON_CLASS} aria-hidden="true" />
      </HomeLink>
    </>
  );
}

export default function HomeTabs() {
  const [active, setActive] = useState<TabId>('work');
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const focusTab = (id: TabId) => {
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex(tab => tab.id === active);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      focusTab(TABS[(index + delta + TABS.length) % TABS.length].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusTab(TABS[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusTab(TABS[TABS.length - 1].id);
    }
  };

  return (
    <section
      className="py-8 px-6 flex-1 bg-gradient-to-b from-transparent to-neutral-800/20"
      aria-label="Homepage sections"
    >
      <div className="container mx-auto max-w-6xl">
        <div
          role="tablist"
          aria-label="Homepage sections"
          aria-orientation="horizontal"
          onKeyDown={handleKeyDown}
          className="mb-10 flex justify-center gap-2 border-b border-neutral-500/20"
        >
          {TABS.map(tab => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={node => {
                  tabRefs.current[tab.id] = node;
                }}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={`cursor-pointer px-5 py-3 text-lg font-bold transition-colors duration-200 -mb-px border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded-t ${
                  selected
                    ? 'border-brand-400 text-brand-400'
                    : 'border-transparent text-neutral-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {TABS.map(tab => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            tabIndex={0}
            hidden={tab.id !== active}
          >
            <div className="text-center mb-10 animate-fade-in-up">
              <p className="text-neutral-300 text-base max-w-2xl mx-auto">{tab.description}</p>
            </div>
            <nav
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto"
              aria-label={`${tab.label} links`}
            >
              {linksFor(tab.id)}
            </nav>
          </div>
        ))}
      </div>
    </section>
  );
}
