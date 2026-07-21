import type { ReactNode } from 'react';

import type { StoryTheme } from '@/types/wedding';

interface StoryPageProps {
  // Illustration URL. Absent → decorative placeholder frame (art lands in W-G).
  art?: string;
  artAlt?: string;
  chapterLabel?: string; // "Chapter One"
  title?: string; // "The Meeting"
  theme?: StoryTheme; // tints the placeholder while there's no art
  children?: ReactNode; // storybook prose, overlaid in the bottom safe-zone
}

// Placeholder washes per chapter theme — replaced by real art in W-G.
const PLACEHOLDER_THEMES: Record<StoryTheme, string> = {
  dawn: 'bg-gradient-to-b from-[#f6d8b8] via-[var(--sb-cream)] to-[var(--sb-gold)]/50',
  forest: 'bg-gradient-to-b from-[#c8d6c0] via-[var(--sb-cream)] to-[#8ba888]/60',
  night: 'bg-gradient-to-b from-[#2b3a55] via-[#4a5878] to-[var(--sb-crimson)]/70',
  festival: 'bg-gradient-to-b from-[#f3c1b6] via-[var(--sb-cream)] to-[var(--sb-crimson)]/40'
};

/**
 * One full-bleed picture-book page (spec §6): edge-to-edge art with the prose
 * overlaid in a bottom safe-zone (gradient scrim + text shadow keep it legible
 * over any illustration — generated art keeps its lower third calm for this).
 */
export const StoryPage = ({ art, artAlt, chapterLabel, title, theme = 'dawn', children }: StoryPageProps) => (
  <div className="relative h-full w-full overflow-hidden bg-[var(--sb-cream)]">
    {art ? (
      <img
        src={art}
        alt={artAlt ?? ''}
        width={1600}
        height={2400}
        className="storybook-art-float absolute inset-0 h-full w-full object-cover"
      />
    ) : (
      <div className={`absolute inset-0 ${PLACEHOLDER_THEMES[theme]}`} aria-hidden>
        <p className="absolute inset-x-0 top-1/3 text-center font-pacifico text-2xl text-[var(--sb-ink)]/15">
          illustration soon
        </p>
      </div>
    )}

    {/* Decorative inner border, above the art */}
    <div className="pointer-events-none absolute inset-3 rounded-md border border-[var(--sb-gold)]/60" />

    {/* Bottom text safe-zone — scrim + shadow keep prose readable over art */}
    {(chapterLabel || title || children) && (
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--sb-ink)]/80 via-[var(--sb-ink)]/45 to-transparent pt-20">
        <div className="mx-auto max-h-[45dvh] w-full max-w-xl overflow-y-auto px-8 pb-8 text-center [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
          {chapterLabel && (
            <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-gold)]">{chapterLabel}</p>
          )}
          {title && <h2 className="mt-2 font-pacifico text-3xl text-[var(--sb-white)]">{title}</h2>}
          {children && (
            <div className="mt-4 space-y-3 font-garamond text-base leading-relaxed text-[var(--sb-cream)]">
              {children}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
