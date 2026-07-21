import type { PublicWeddingConfig } from '@/types/wedding';
import { LogisticsPage } from './LogisticsPage';

interface TravelPageProps {
  config: PublicWeddingConfig;
}

interface NoteBlockProps {
  heading: string;
  text?: string;
}

const NoteBlock = ({ heading, text }: NoteBlockProps) =>
  text ? (
    <section className="text-center">
      <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--sb-crimson)]">{heading}</h3>
      <p className="mt-1 whitespace-pre-line text-sm">{text}</p>
    </section>
  ) : null;

// Travel + parking + dress code + announcements — the "good to know" page.
export const TravelPage = ({ config }: TravelPageProps) => (
  <LogisticsPage kicker="The Plan" title="Good to Know">
    {config.dressCode && (config.dressCode.title || config.dressCode.description) && (
      <section className="text-center">
        <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--sb-crimson)]">Dress Code</h3>
        {config.dressCode.title && <p className="mt-1 text-lg font-semibold text-[var(--sb-ink)]">{config.dressCode.title}</p>}
        {config.dressCode.description && <p className="mt-1 text-sm">{config.dressCode.description}</p>}
      </section>
    )}
    <NoteBlock heading="Parking" text={config.travel?.parking} />
    <NoteBlock heading="Airports" text={config.travel?.airports} />
    <NoteBlock heading="Directions" text={config.travel?.directions} />
    <NoteBlock heading="Travel Notes" text={config.travel?.notes} />
    {(config.announcements ?? []).map(announcement => (
      <p key={announcement} className="text-center text-sm italic">
        {announcement}
      </p>
    ))}
  </LogisticsPage>
);

// The builder uses this to drop the page when there's nothing to say.
export const hasTravelContent = (config: PublicWeddingConfig): boolean =>
  Boolean(
    config.dressCode?.title ||
      config.dressCode?.description ||
      config.travel?.parking ||
      config.travel?.airports ||
      config.travel?.directions ||
      config.travel?.notes ||
      (config.announcements ?? []).length > 0
  );
