'use client';

import { useState } from 'react';

import type { ScheduleItem, WeddingGuideConfig } from '@/types/wedding';
import { pickDefaultMapIndex } from '@/utils/scheduleTime';
import { GuideSection } from '../GuideSection';

interface VenueSectionProps {
  venue: WeddingGuideConfig['venue'];
  venueName: string;
  schedule: ScheduleItem[];
  weddingDate: string;
  timeZone: string;
  initialNow: number;
}

export const VenueSection = ({ venue, venueName, schedule, weddingDate, timeZone, initialNow }: VenueSectionProps) => {
  // Chosen once from the load time; after that the guest drives the toggle
  const [mapIndex, setMapIndex] = useState(() =>
    pickDefaultMapIndex(venue.maps, schedule, weddingDate, timeZone, initialNow)
  );
  const map = venue.maps[mapIndex];
  const [firstParagraph, ...moreParagraphs] = (venue.history ?? '').split(/\n\s*\n/).filter(Boolean);

  return (
    <GuideSection id="venue" title={venueName || 'The venue'}>
      {firstParagraph && <p className="font-garamond text-lg leading-relaxed">{firstParagraph}</p>}
      {moreParagraphs.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer font-garamond text-[var(--sb-crimson)]">Read more</summary>
          <div className="mt-2 space-y-3">
            {moreParagraphs.map(paragraph => (
              <p key={paragraph.slice(0, 40)} className="font-garamond text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </details>
      )}

      {venue.funFacts.length > 0 && (
        <div className="mt-5">
          <h3 className="font-garamond text-sm uppercase tracking-[0.25em] text-[var(--sb-crimson)]">Fun facts</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-[var(--sb-gold)]">
            {venue.funFacts.map(fact => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      )}

      {map && (
        <div className="mt-5">
          {venue.maps.length > 1 && (
            <div role="group" aria-label="Map layout" className="mb-3 flex rounded-full border border-[var(--sb-gold)] p-1">
              {venue.maps.map((option, index) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={index === mapIndex}
                  onClick={() => setMapIndex(index)}
                  className="min-h-11 flex-1 rounded-full font-garamond transition-colors aria-pressed:bg-[var(--sb-crimson)] aria-pressed:text-[var(--sb-white)]"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <a href={map.src} target="_blank" rel="noreferrer" aria-label={`Open the ${map.label} map full size`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={map.src}
              alt={map.alt}
              width={map.width}
              height={map.height}
              loading="lazy"
              className="h-auto w-full rounded-lg border border-[var(--sb-gold)]"
            />
          </a>
          <p className="mt-1 text-center text-xs opacity-70">Tap the map to open it full size</p>
        </div>
      )}

      {venue.practical.length > 0 && (
        <dl className="mt-5 divide-y divide-[var(--sb-gold)]/40">
          {venue.practical.map(item => (
            <div key={item.label} className="flex gap-4 py-2">
              <dt className="w-28 shrink-0 font-garamond text-[var(--sb-crimson)]">{item.label}</dt>
              <dd className="min-w-0 break-words">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </GuideSection>
  );
};
