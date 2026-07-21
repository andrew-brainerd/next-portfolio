import type { PublicWeddingConfig } from '@/types/wedding';

interface StorybookCoverProps {
  config: PublicWeddingConfig;
}

const formatWeddingDate = (isoDate: string): string => {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// The unlocked opening view — a W-C placeholder the W-D StorybookReader replaces.
// Server component: renders straight from the public config.
export const StorybookCover = ({ config }: StorybookCoverProps) => {
  const { partnerA, partnerB } = config.coupleNames;
  const names = partnerA && partnerB ? `${partnerA} & ${partnerB}` : partnerA || partnerB || 'Our Wedding';
  const date = config.weddingDate ? formatWeddingDate(config.weddingDate) : '';

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#ede6e1] p-6">
      <div className="w-full max-w-2xl rounded-2xl border-4 border-[#d4a770] bg-[#fafafa] p-8 text-center shadow-2xl sm:p-14">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8c0707]">The story of</p>
        <h1 className="mt-4 font-pacifico text-5xl text-[#000000] sm:text-6xl">{names}</h1>
        {config.tagline && <p className="mt-4 text-lg italic text-neutral-600">{config.tagline}</p>}
        {date && <p className="mt-6 text-sm uppercase tracking-[0.2em] text-[#8c0707]">{date}</p>}

        <div className="mx-auto mt-10 max-w-md rounded-lg border border-[#d4a770]/60 bg-[#ede6e1]/60 p-5">
          <p className="text-sm text-neutral-700">
            The illustrated pages are still at the printer&apos;s — check back soon to read the whole story.
          </p>
        </div>
      </div>
    </main>
  );
};
