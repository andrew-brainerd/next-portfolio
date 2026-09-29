import Link from 'next/link';
import type { CSSProperties } from 'react';

import {
  WEDDING_DETAILS_ROUTE,
  WEDDING_GUIDE_ROUTE,
  WEDDING_RSVP_ROUTE,
  WEDDING_STORY_ROUTE
} from '@/constants/routes';
import type { PublicWeddingConfig, WeddingFeatures, WeddingHubTile } from '@/types/wedding';
import { formatWeddingDate, formatWindowOpening } from '@/utils/wedding';
import { daysUntilWedding } from '@/utils/weddingFeatures';
import { DetailsIcon, GuideIcon, RsvpIcon, StoryIcon } from './HubIcons';

const buildTiles = (config: PublicWeddingConfig, features: WeddingFeatures): WeddingHubTile[] => {
  const deadline = config.rsvp.deadline ? formatWeddingDate(config.rsvp.deadline) : '';
  const tiles: (WeddingHubTile | false)[] = [
    features.story && {
      href: WEDDING_STORY_ROUTE,
      title: 'Our Story',
      blurb: 'How we got here, told as an illustrated storybook.',
      icon: <StoryIcon />
    },
    features.details && {
      href: WEDDING_DETAILS_ROUTE,
      title: 'Venue & Hotels',
      blurb: 'Where, when, and where to stay.',
      icon: <DetailsIcon />
    },
    features.rsvp && {
      href: WEDDING_RSVP_ROUTE,
      title: 'RSVP',
      blurb: deadline ? `Kindly reply by ${deadline}.` : 'Let us know if you can make it.',
      icon: <RsvpIcon />
    },
    features.guide && {
      href: WEDDING_GUIDE_ROUTE,
      title: 'Wedding Day Guide',
      blurb: 'Your seat, the schedule, the menu and more.',
      icon: <GuideIcon />
    }
  ];
  return tiles.filter((tile): tile is WeddingHubTile => !!tile);
};

interface WeddingHubProps {
  config: PublicWeddingConfig;
  features: WeddingFeatures;
  now: number;
}

// The /wedding landing page: one animated tile per guest page whose release window is open.
export const WeddingHub = ({ config, features, now }: WeddingHubProps) => {
  const { partnerA, partnerB } = config.coupleNames;
  const names = partnerA && partnerB ? `${partnerA} & ${partnerB}` : partnerA || partnerB || 'Our Wedding';
  const date = formatWeddingDate(config.weddingDate);
  const daysToGo = daysUntilWedding(features.weddingStartsAt, now);
  const tiles = buildTiles(config, features);

  return (
    <main className="storybook storybook-backdrop flex min-h-dvh flex-col items-center px-4 py-10 sm:py-16">
      <header className="wedding-hub-rise w-full max-w-lg rounded-2xl border-4 border-[var(--sb-gold)] bg-[var(--sb-crimson)] p-2 text-center shadow-2xl">
        <div className="rounded-xl border border-[var(--sb-gold)]/60 px-6 py-8">
          <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-gold)]">The wedding of</p>
          <h1 className="mt-3 font-pacifico text-4xl text-[var(--sb-white)] sm:text-5xl">{names}</h1>
          {config.tagline && <p className="mt-4 font-garamond text-lg italic text-[var(--sb-cream)]/85">{config.tagline}</p>}
          {date && <p className="mt-5 font-garamond text-sm uppercase tracking-[0.2em] text-[var(--sb-gold)]">{date}</p>}
          {!!daysToGo && (
            <p className="mt-4 inline-block rounded-full border border-[var(--sb-gold)]/70 px-4 py-1 font-garamond text-sm text-[var(--sb-cream)]">
              {daysToGo === 1 ? 'Tomorrow!' : `${daysToGo} days to go`}
            </p>
          )}
        </div>
      </header>

      {tiles.length > 0 ? (
        <nav aria-label="Wedding pages" className="mt-8 w-full max-w-lg">
          <ul className="space-y-4">
            {tiles.map((tile, index) => (
              <li key={tile.href}>
                <Link
                  href={tile.href}
                  style={{ '--i': index } as CSSProperties}
                  className="wedding-hub-tile group relative flex min-h-24 items-center gap-4 overflow-hidden rounded-2xl border-2 border-[var(--sb-gold)] bg-[var(--sb-cream)] p-5 shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-[var(--sb-gold)]"
                >
                  <span className="wedding-hub-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--sb-crimson)] text-[var(--sb-gold)]">
                    {tile.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-pacifico text-2xl text-[var(--sb-crimson)]">{tile.title}</span>
                    <span className="mt-1 block font-garamond text-base text-[var(--sb-ink)]/75">{tile.blurb}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-auto text-2xl text-[var(--sb-crimson)] transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <p className="wedding-hub-rise mt-8 w-full max-w-lg rounded-2xl border-2 border-[var(--sb-gold)] bg-[var(--sb-cream)] p-6 text-center font-garamond text-lg text-[var(--sb-ink)]/85 shadow-lg">
          {features.storyOpensAt ? (
            <>
              Our story opens on{' '}
              <span className="font-semibold text-[var(--sb-crimson)]">
                {formatWindowOpening(features.storyOpensAt, config.guide.timeZone)}
              </span>
              . Check back then for the story, the venue and where to stay.
            </>
          ) : (
            'More is on the way. Check back soon!'
          )}
        </p>
      )}
    </main>
  );
};
