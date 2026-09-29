'use client';

import { useState } from 'react';

import { SHARE_DESTINATIONS } from '@/constants/wedding';
import type { ShareDestination, ShareLinkOption } from '@/types/wedding';
import { CopyButton } from './CopyButton';
import { SelectField } from './FormFields';

const BUTTON_CLASS =
  'rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800';

interface ShareLinkControlsProps {
  links: ShareLinkOption[]; // never empty
}

// Split from the panel so every render has a link: the React Compiler reads `link.url`
// while memoizing the handlers below, before any JSX guard would run.
const ShareLinkControls = ({ links }: ShareLinkControlsProps) => {
  const [to, setTo] = useState<ShareDestination>('hub');
  const [status, setStatus] = useState<string | undefined>();
  const link = links.find(option => option.to === to) ?? links[0];

  const share = async () => {
    setStatus(undefined);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Our Wedding', url: link.url });
      } catch (error) {
        // Closing the share sheet rejects with AbortError — not a failure
        if ((error as DOMException).name !== 'AbortError') setStatus("Couldn't open the share sheet.");
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(link.url);
      setStatus('Sharing isn’t supported here, so the link was copied instead.');
    } catch {
      setStatus("Couldn't share or copy the link.");
    }
  };

  const downloadQr = () => {
    const url = URL.createObjectURL(new Blob([link.svg], { type: 'image/svg+xml' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `wedding-${link.to}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 space-y-4">
      <SelectField
        label="Opens"
        value={to}
        onChange={setTo}
        options={SHARE_DESTINATIONS.filter(({ value }) => links.some(option => option.to === value))}
      />
      <div className="flex items-center gap-4">
        <div
          className="h-24 w-24 shrink-0 rounded bg-white p-1 [&>svg]:h-full [&>svg]:w-full"
          // SVG markup comes from the qrcode library, not user input
          dangerouslySetInnerHTML={{ __html: link.svg }}
        />
        <div className="min-w-0 flex-1">
          <p className="break-all font-mono text-xs text-neutral-400">{link.url}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyButton value={link.url} label="Copy link" />
            <button type="button" onClick={share} className={BUTTON_CLASS}>
              Share
            </button>
            <button type="button" onClick={downloadQr} className={BUTTON_CLASS}>
              Download QR
            </button>
          </div>
          <p aria-live="polite" className="mt-2 min-h-4 text-xs text-neutral-400">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};

interface ShareLinkPanelProps {
  links: ShareLinkOption[];
}

// Built from the saved share key (spec wedding.md §3 "Share link"). QR SVGs come from the server.
export const ShareLinkPanel = ({ links }: ShareLinkPanelProps) => (
  <section className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-5">
    <h2 className="text-lg font-semibold text-neutral-100">Share link</h2>
    <p className="mt-1 text-sm text-neutral-400">
      Anyone with this link skips the passcode. Pages that aren&apos;t open yet fall back to the wedding home page.
      Reflects the last saved settings.
    </p>
    {links.length === 0 ? (
      <p className="mt-4 text-sm text-neutral-500">Generate and save a share-link key under Guest access to get a link.</p>
    ) : (
      <ShareLinkControls links={links} />
    )}
  </section>
);
