import type { GuideTagLink } from '@/types/wedding';
import { PrintButton } from './PrintButton';

const NfcIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M6 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
    <path d="M9.5 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
    <path d="M13 3.5a12 12 0 0 1 0 17" strokeLinecap="round" />
  </svg>
);

interface TableCardsProps {
  links: GuideTagLink[];
  fallbackUrl: string;
}

// Printable cards: one per table plus the welcome sign. Letter paper, two per row.
export const TableCards = ({ links, fallbackUrl }: TableCardsProps) => (
  <main className="storybook min-h-dvh bg-[var(--sb-white)] p-6 text-[var(--sb-ink)] print:p-0">
    <div className="mb-6 flex items-center justify-between print:hidden">
      <p className="text-sm text-neutral-600">
        {links.length} cards. Stick an NFC tag on the back of each, written with the same URL.
      </p>
      <PrintButton />
    </div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2 print:gap-4">
      {links.map(link => (
        <article
          key={link.url}
          className="flex break-inside-avoid flex-col items-center gap-3 rounded-lg border-2 border-[var(--sb-gold)] bg-[var(--sb-cream)] p-6 text-center"
        >
          <h2 className="font-garamond text-3xl text-[var(--sb-crimson)]">{link.label}</h2>
          <div
            className="h-44 w-44 rounded bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
            // SVG markup comes from the qrcode library, not user input
            dangerouslySetInnerHTML={{ __html: link.svg }}
          />
          <p className="flex items-center gap-2 font-garamond text-lg">
            Scan or tap
            <NfcIcon />
            for your wedding guide
          </p>
          <p className="text-xs text-neutral-600">or visit {fallbackUrl}</p>
        </article>
      ))}
    </div>
  </main>
);
