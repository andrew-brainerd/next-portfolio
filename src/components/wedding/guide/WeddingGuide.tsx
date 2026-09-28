import type { ReactNode } from 'react';

import type { GuideSectionId, PublicWeddingConfig } from '@/types/wedding';
import { formatWeddingDate } from '@/utils/wedding';
import { getGuideSections } from '@/utils/weddingGuide';
import { NowNextCard } from './NowNextCard';
import { SectionNav } from './SectionNav';
import { YourTableCard } from './YourTableCard';
import { HotelsSection } from './sections/HotelsSection';
import { MenuSection } from './sections/MenuSection';
import { RegistrySection } from './sections/RegistrySection';
import { SeatingSection } from './sections/SeatingSection';
import { TimelineSection } from './sections/TimelineSection';
import { VenueSection } from './sections/VenueSection';

interface WeddingGuideProps {
  config: PublicWeddingConfig;
  initialNow: number;
  tableId?: string;
}

// The day-of guidebook: header, pinned cards, sticky section chips, then one card per section
export const WeddingGuide = ({ config, initialNow, tableId }: WeddingGuideProps) => {
  const { guide } = config;
  const { partnerA, partnerB } = config.coupleNames;

  const renderers: Partial<Record<GuideSectionId, ReactNode>> = {
    seating: <SeatingSection tables={guide.seating} initialTableId={tableId} />,
    timeline: (
      <TimelineSection
        schedule={config.schedule}
        weddingDate={config.weddingDate}
        timeZone={guide.timeZone}
        initialNow={initialNow}
      />
    ),
    menu: <MenuSection menu={guide.menu} />,
    venue: (
      <VenueSection
        venue={guide.venue}
        venueName={config.reception.venueName}
        schedule={config.schedule}
        weddingDate={config.weddingDate}
        timeZone={guide.timeZone}
        initialNow={initialNow}
      />
    ),
    registry: <RegistrySection config={config} />,
    hotels: <HotelsSection hotels={config.hotels} />
  };
  const sections = getGuideSections(config).filter(section => renderers[section.id]);

  return (
    <main className="storybook min-h-dvh bg-[var(--sb-cream)] text-[var(--sb-ink)]">
      <header className="px-4 pt-10 pb-6 text-center">
        <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-crimson)]">The wedding of</p>
        <h1 className="mt-2 font-pacifico text-4xl text-[var(--sb-crimson)]">
          {partnerA && partnerB ? `${partnerA} & ${partnerB}` : 'Our Wedding'}
        </h1>
        <p className="mt-2 font-garamond text-lg">
          {[formatWeddingDate(config.weddingDate), config.reception.venueName].filter(Boolean).join(' · ')}
        </p>
        {guide.welcome && <p className="mx-auto mt-3 max-w-md font-garamond text-base opacity-80">{guide.welcome}</p>}
      </header>

      <SectionNav sections={sections} />

      <div className="mx-auto max-w-xl space-y-5 px-4 pt-5 pb-16">
        <NowNextCard
          schedule={config.schedule}
          weddingDate={config.weddingDate}
          timeZone={guide.timeZone}
          initialNow={initialNow}
          showMessageLink={guide.messages.enabled}
        />
        <YourTableCard tables={guide.seating} />
        {sections.map(section => (
          <div key={section.id}>{renderers[section.id]}</div>
        ))}
      </div>
    </main>
  );
};
