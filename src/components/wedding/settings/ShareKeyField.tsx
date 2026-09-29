'use client';

import { generateShareKey } from '@/utils/weddingGuide';
import { shareLinkUrls } from '@/utils/weddingShare';
import { CopyButton } from './CopyButton';

interface ShareKeyFieldProps {
  shareKey: string;
  savedShareKey: string;
  enterUrl: string;
  onChange: (shareKey: string) => void;
}

export const ShareKeyField = ({ shareKey, savedShareKey, enterUrl, onChange }: ShareKeyFieldProps) => {
  // The first URL opens the wedding home page; the Share link section offers the other destinations
  const homeUrl = shareLinkUrls(enterUrl, shareKey)[0]?.url;
  const unsaved = shareKey !== savedShareKey;

  const regenerate = () => {
    // Every link already sent embeds the key — confirm before invalidating them
    if (shareKey && !window.confirm('A new key disables every share link you have already sent. Continue?')) return;
    onChange(generateShareKey());
  };

  return (
    <div>
      <p className="text-sm text-neutral-300">Share link</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <code className="min-w-0 break-all rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 font-mono text-sm text-neutral-100">
          {homeUrl ?? 'Not set'}
        </code>
        {homeUrl && !unsaved && <CopyButton value={homeUrl} label="Copy link" />}
        <button
          type="button"
          onClick={regenerate}
          className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-brand-400 hover:text-neutral-100"
        >
          {shareKey ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      {unsaved && homeUrl && <p className="mt-1 text-xs text-amber-400">Save to turn this link on.</p>}
      <p className="mt-1 text-xs text-neutral-500">
        Anyone with the link skips the passcode. Regenerate to turn off every link you&apos;ve sent without changing the
        passcode or the table cards.
      </p>
    </div>
  );
};
