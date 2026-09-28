import Link from 'next/link';

import { WEDDING_CARDS_ROUTE } from '@/constants/routes';
import type { GuideTagLink } from '@/types/wedding';
import { CopyButton } from './CopyButton';

interface TagLinksProps {
  links: GuideTagLink[];
}

// Server component — QR SVGs are generated server-side from the saved config
export const TagLinks = ({ links }: TagLinksProps) => (
  <section className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-neutral-100">QR codes &amp; NFC tags</h2>
      {links.length > 0 && (
        <Link
          href={WEDDING_CARDS_ROUTE}
          className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-brand-400"
        >
          Print table cards
        </Link>
      )}
    </div>
    <p className="mt-1 text-sm text-neutral-400">
      Write each URL to an NFC tag (one NDEF URL record, then lock it). Reflects the last saved settings.
    </p>
    {links.length === 0 ? (
      <p className="mt-4 text-sm text-neutral-500">Generate and save a tag key to get links.</p>
    ) : (
      <ul className="mt-4 space-y-3">
        {links.map(link => (
          <li key={link.url} className="flex items-center gap-4">
            <div
              className="h-16 w-16 shrink-0 rounded bg-white p-1 [&>svg]:h-full [&>svg]:w-full"
              // SVG markup comes from the qrcode library, not user input
              dangerouslySetInnerHTML={{ __html: link.svg }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-100">{link.label}</p>
              <p className="truncate font-mono text-xs text-neutral-400">{link.url}</p>
            </div>
            <CopyButton value={link.url} />
          </li>
        ))}
      </ul>
    )}
  </section>
);
