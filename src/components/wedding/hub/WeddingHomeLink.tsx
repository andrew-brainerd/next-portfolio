import Link from 'next/link';

import { WEDDING_ROUTE } from '@/constants/routes';

// Back to the /wedding hub from any guest page. Carries its own .storybook scope for the palette.
export const WeddingHomeLink = () => (
  <Link
    href={WEDDING_ROUTE}
    className="storybook fixed top-3 left-3 z-40 flex min-h-11 items-center gap-2 rounded-full border border-[var(--sb-gold)] bg-[var(--sb-crimson)]/95 px-4 font-garamond text-sm text-[var(--sb-cream)] shadow-lg transition-colors hover:bg-[var(--sb-crimson)] hover:text-[var(--sb-white)]"
  >
    <span aria-hidden="true">←</span>
    Wedding home
  </Link>
);
