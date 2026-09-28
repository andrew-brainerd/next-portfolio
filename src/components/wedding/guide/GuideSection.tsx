import type { ReactNode } from 'react';

import type { GuideSectionId } from '@/types/wedding';

interface GuideSectionProps {
  id: GuideSectionId;
  title: string;
  children: ReactNode;
}

// One card in the guidebook. scroll-mt clears the sticky section nav on anchor jumps.
export const GuideSection = ({ id, title, children }: GuideSectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-heading`}
    className="scroll-mt-16 rounded-xl border border-[var(--sb-gold)]/70 bg-[var(--sb-white)] p-5 shadow-sm"
  >
    <h2 id={`${id}-heading`} className="font-garamond text-2xl text-[var(--sb-crimson)]">
      {title}
    </h2>
    <div aria-hidden="true" className="mt-1 mb-4 flex items-center gap-2 text-[var(--sb-gold)]">
      <span className="h-px flex-1 bg-current opacity-60" />
      <svg viewBox="0 0 10 10" width="8" height="8" fill="currentColor">
        <path d="M5 0 10 5 5 10 0 5z" />
      </svg>
      <span className="h-px flex-1 bg-current opacity-60" />
    </div>
    {children}
  </section>
);
