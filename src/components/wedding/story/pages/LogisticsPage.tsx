import type { ReactNode } from 'react';

interface LogisticsPageProps {
  kicker: string; // small gold eyebrow, e.g. "The Plan"
  title: string; // Pacifico headline, e.g. "The Big Day"
  children: ReactNode;
}

/**
 * The practical pages share one parchment frame: cream paper, gold border,
 * Garamond body — same book, calmer than the illustrated chapters. Content
 * scrolls inside the frame if a section runs long (FAQ, schedule).
 */
export const LogisticsPage = ({ kicker, title, children }: LogisticsPageProps) => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--sb-cream)]">
    <div className="pointer-events-none absolute inset-3 rounded-md border border-[var(--sb-gold)]/60" />
    <header className="shrink-0 px-8 pt-10 text-center">
      <p className="font-garamond text-xs uppercase tracking-[0.3em] text-[var(--sb-crimson)]">{kicker}</p>
      <h2 className="mt-2 font-pacifico text-3xl text-[var(--sb-ink)]">{title}</h2>
      <div className="mx-auto mt-4 h-px w-16 bg-[var(--sb-gold)]" />
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-10 pt-6">
      <div className="mx-auto max-w-md space-y-5 font-garamond text-[var(--sb-ink)]/85">{children}</div>
    </div>
  </div>
);
