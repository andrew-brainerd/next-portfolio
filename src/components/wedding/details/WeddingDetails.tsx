import type { ReactNode } from 'react';

import type { PublicWeddingConfig } from '@/types/wedding';
import { FaqPage } from '@/components/wedding/story/pages/FaqPage';
import { HotelsPage } from '@/components/wedding/story/pages/HotelsPage';
import { RegistryPage } from '@/components/wedding/story/pages/RegistryPage';
import { SchedulePage } from '@/components/wedding/story/pages/SchedulePage';
import { TravelPage, hasTravelContent } from '@/components/wedding/story/pages/TravelPage';
import { VenuePage } from '@/components/wedding/story/pages/VenuePage';

interface DetailsCardProps {
  children: ReactNode;
}

const DetailsCard = ({ children }: DetailsCardProps) => (
  <section className="wedding-hub-rise overflow-hidden rounded-2xl shadow-lg">{children}</section>
);

interface WeddingDetailsProps {
  config: PublicWeddingConfig;
}

// /wedding/details: the practical pages that used to sit in the back half of the book,
// stacked as parchment cards. Sections without content are left out.
export const WeddingDetails = ({ config }: WeddingDetailsProps) => (
  <main className="storybook storybook-backdrop min-h-dvh px-4 pt-20 pb-12">
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="wedding-hub-rise relative h-56 overflow-hidden rounded-2xl border-4 border-[var(--sb-gold)] bg-[var(--sb-crimson)] shadow-2xl">
        <img
          src="/wedding/plan-divider.jpg"
          alt="Illustration of Andrew and Hayley wedding-planning together over a planner, venue photos, and fabric swatches"
          width={1600}
          height={2400}
          className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--sb-crimson)] to-transparent px-6 pt-16 pb-5 text-center">
          <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-gold)]">The Plan</p>
          <h1 className="mt-1 font-pacifico text-4xl text-[var(--sb-white)]">Venue &amp; Hotels</h1>
        </div>
      </header>

      <DetailsCard>
        <VenuePage config={config} />
      </DetailsCard>
      {config.schedule.length > 0 && (
        <DetailsCard>
          <SchedulePage schedule={config.schedule} />
        </DetailsCard>
      )}
      {config.hotels.length > 0 && (
        <DetailsCard>
          <HotelsPage hotels={config.hotels} />
        </DetailsCard>
      )}
      {hasTravelContent(config) && (
        <DetailsCard>
          <TravelPage config={config} />
        </DetailsCard>
      )}
      {(config.registry.length > 0 || !!config.honeymoonFund) && (
        <DetailsCard>
          <RegistryPage config={config} />
        </DetailsCard>
      )}
      {config.faq.length > 0 && (
        <DetailsCard>
          <FaqPage faq={config.faq} />
        </DetailsCard>
      )}
    </div>
  </main>
);
