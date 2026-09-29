'use client';

import { useEffect, useState } from 'react';

import { getShareLinkQrSvg } from '@/api/weddingShareLink';
import { SHARE_DESTINATIONS } from '@/constants/wedding';
import type { ShareDestination, ShareLinkOption } from '@/types/wedding';
import { zonedLocalToIso } from '@/utils/weddingGuide';
import { withPreviewAt } from '@/utils/weddingShare';
import { CopyButton } from './CopyButton';
import { SelectField, TextField } from './FormFields';

const BUTTON_CLASS =
  'rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800';

interface ShareLinkControlsProps {
  links: ShareLinkOption[]; // never empty
  timeZone: string;
}

// Split from the panel so every render has a link: the React Compiler reads `link.url`
// while memoizing the handlers below, before any JSX guard would run.
const ShareLinkControls = ({ links, timeZone }: ShareLinkControlsProps) => {
  const [to, setTo] = useState<ShareDestination>('hub');
  const [status, setStatus] = useState<string | undefined>();
  const [previewLocal, setPreviewLocal] = useState('');
  const [previewAt, setPreviewAt] = useState<number | undefined>();
  const [previewError, setPreviewError] = useState<string | undefined>();
  const [previewQr, setPreviewQr] = useState<{ url: string; svg: string } | undefined>();
  const link = links.find(option => option.to === to) ?? links[0];
  const url = withPreviewAt(link.url, previewAt);
  // Plain links come with a server-built QR; a preview-date link gets its own
  const svg = previewAt ? (previewQr?.url === url ? previewQr.svg : undefined) : link.svg;

  useEffect(() => {
    if (!previewAt) return;
    let cancelled = false;
    getShareLinkQrSvg(url).then(qr => {
      if (!cancelled) setPreviewQr({ url, svg: qr });
    });
    return () => {
      cancelled = true;
    };
  }, [previewAt, url]);

  const changePreview = (local: string) => {
    setPreviewLocal(local);
    setStatus(undefined);
    const at = local ? Date.parse(zonedLocalToIso(local, timeZone)) : NaN;
    if (!local || at > Date.now()) {
      setPreviewAt(local ? at : undefined);
      setPreviewError(undefined);
    } else {
      setPreviewAt(undefined);
      setPreviewError('Pick a future date. An earlier one would open on real time.');
    }
  };

  const share = async () => {
    setStatus(undefined);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Our Wedding', url });
      } catch (error) {
        // Closing the share sheet rejects with AbortError — not a failure
        if ((error as DOMException).name !== 'AbortError') setStatus("Couldn't open the share sheet.");
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus('Sharing isn’t supported here, so the link was copied instead.');
    } catch {
      setStatus("Couldn't share or copy the link.");
    }
  };

  const downloadQr = () => {
    if (!svg) return;
    const objectUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `wedding-${link.to}${previewAt ? '-preview' : ''}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="mt-4 space-y-4">
      <SelectField
        label="Opens"
        value={to}
        onChange={setTo}
        options={SHARE_DESTINATIONS.filter(({ value }) => links.some(option => option.to === value))}
      />
      <div>
        <TextField
          label="Preview date (optional)"
          type="datetime-local"
          value={previewLocal}
          onChange={changePreview}
          hint={`Opens the site as if it were this date (${timeZone}), then keeps ticking. Leave empty for real time.`}
        />
        {previewError && <p className="mt-1 text-xs text-amber-400">{previewError}</p>}
      </div>
      <div className="flex items-center gap-4">
        {svg ? (
          <div
            className="h-24 w-24 shrink-0 rounded bg-white p-1 [&>svg]:h-full [&>svg]:w-full"
            // SVG markup comes from the qrcode library, not user input
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="h-24 w-24 shrink-0 animate-pulse rounded bg-neutral-800" aria-label="Building QR code" />
        )}
        <div className="min-w-0 flex-1">
          <p className="break-all font-mono text-xs text-neutral-400">{url}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <CopyButton value={url} label="Copy link" />
            <button type="button" onClick={share} className={BUTTON_CLASS}>
              Share
            </button>
            <button type="button" onClick={downloadQr} disabled={!svg} className={BUTTON_CLASS}>
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
  timeZone: string;
}

// Built from the saved share key (spec wedding.md §3 "Share link"). QR SVGs come from the server.
export const ShareLinkPanel = ({ links, timeZone }: ShareLinkPanelProps) => (
  <section className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-5">
    <h2 className="text-lg font-semibold text-neutral-100">Share link</h2>
    <p className="mt-1 text-sm text-neutral-400">
      Anyone with this link skips the passcode. Pages that aren&apos;t open yet fall back to the wedding home page.
      Reflects the last saved settings.
    </p>
    {links.length === 0 ? (
      <p className="mt-4 text-sm text-neutral-500">Generate and save a share-link key under Guest access to get a link.</p>
    ) : (
      <ShareLinkControls links={links} timeZone={timeZone} />
    )}
  </section>
);
