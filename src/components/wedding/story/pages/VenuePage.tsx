import type { EventBlock, PublicWeddingConfig } from '@/types/wedding';
import { formatWeddingDate } from '@/utils/wedding';
import { LogisticsPage } from './LogisticsPage';

interface EventDetailsProps {
  heading: string;
  event: EventBlock & { invited?: string };
  fallbackDate?: string; // formatted wedding date, used when the block has none
}

const EventDetails = ({ heading, event, fallbackDate }: EventDetailsProps) => {
  const date = formatWeddingDate(event.date ?? '') || fallbackDate;
  const time = [event.startTime, event.endTime].filter(Boolean).join(' – ');

  return (
    <section className="text-center">
      <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--sb-crimson)]">{heading}</h3>
      {event.venueName && <p className="mt-1 text-xl font-semibold text-[var(--sb-ink)]">{event.venueName}</p>}
      {(date || time) && <p className="mt-1">{[date, time].filter(Boolean).join(' · ')}</p>}
      {event.address && <p className="mt-1 text-sm">{event.address}</p>}
      {event.invited && <p className="mt-1 text-sm italic">{event.invited}</p>}
      {event.notes && <p className="mt-2 text-sm">{event.notes}</p>}
      {event.mapUrl && (
        <a
          href={event.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-[var(--sb-crimson)] underline underline-offset-4 hover:text-[var(--sb-gold-deep)]"
        >
          Open the map
        </a>
      )}
    </section>
  );
};

interface VenuePageProps {
  config: PublicWeddingConfig;
}

// Ceremony + reception (+ rehearsal dinner when configured) on one page.
export const VenuePage = ({ config }: VenuePageProps) => {
  const weddingDate = formatWeddingDate(config.weddingDate);
  const rehearsal = config.rehearsalDinner;

  return (
    <LogisticsPage kicker="The Plan" title="The Big Day">
      {weddingDate && <p className="text-center text-lg">{weddingDate}</p>}
      <EventDetails heading="Ceremony" event={config.ceremony} fallbackDate={weddingDate} />
      <EventDetails heading="Reception" event={config.reception} fallbackDate={weddingDate} />
      {rehearsal && (rehearsal.venueName || rehearsal.invited || rehearsal.date) && (
        <EventDetails heading="Rehearsal Dinner" event={rehearsal} />
      )}
    </LogisticsPage>
  );
};
