import type { PublicWeddingConfig } from '@/types/wedding';
import { formatWeddingDate } from '@/utils/wedding';

interface StorybookCoverProps {
  config: PublicWeddingConfig;
  // Cover illustration (couple in the upper third, flat crimson below — the
  // text renders into that reserved lower area). Falls back to the plain
  // crimson cover when absent.
  art?: string;
  artAlt?: string;
}

// The book's front cover — the first page inside the StorybookReader.
// Fills whatever page frame the reader gives it (h-full, not h-dvh).
export const StorybookCover = ({ config, art, artAlt }: StorybookCoverProps) => {
  const { partnerA, partnerB } = config.coupleNames;
  const names = partnerA && partnerB ? `${partnerA} & ${partnerB}` : partnerA || partnerB || 'Our Wedding';
  const date = formatWeddingDate(config.weddingDate);

  const coverText = (
    <>
      <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-gold)]">The story of</p>
      <h1 className="mt-5 font-pacifico text-4xl text-[var(--sb-white)] sm:text-5xl">{names}</h1>
      {config.tagline && <p className="mt-5 font-garamond text-lg italic text-[var(--sb-cream)]/85">{config.tagline}</p>}
      {date && <p className="mt-8 font-garamond text-sm uppercase tracking-[0.2em] text-[var(--sb-gold)]">{date}</p>}
      <div className="mt-10 h-px w-24 bg-[var(--sb-gold)]/60" />
      <p className="mt-4 font-garamond text-sm text-[var(--sb-cream)]/70">Turn the page to begin</p>
    </>
  );

  if (art) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[var(--sb-crimson)]">
        <img src={art} alt={artAlt ?? ''} width={1600} height={2400} className="absolute inset-0 h-full w-full object-cover" />
        {/* The illustration keeps its lower two-thirds flat crimson — the text lives there */}
        <div className="absolute inset-x-0 bottom-0 top-[42%] flex flex-col items-center justify-center px-6 text-center">
          {coverText}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--sb-crimson)] p-6 sm:p-10">
      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-[var(--sb-gold)]/70 px-6 text-center">
        {coverText}
      </div>
    </div>
  );
};
