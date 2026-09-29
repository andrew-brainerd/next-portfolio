'use client';

import { generateShareKey } from '@/utils/weddingGuide';

interface ShareKeyFieldProps {
  shareKey: string;
  onChange: (shareKey: string) => void;
}

export const ShareKeyField = ({ shareKey, onChange }: ShareKeyFieldProps) => {
  const regenerate = () => {
    // Every link already sent embeds the key — confirm before invalidating them
    if (shareKey && !window.confirm('A new key disables every share link you have already sent. Continue?')) return;
    onChange(generateShareKey());
  };

  return (
    <div>
      <p className="text-sm text-neutral-300">Share-link key</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <code className="rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 font-mono text-neutral-100">
          {shareKey || 'Not set'}
        </code>
        <button
          type="button"
          onClick={regenerate}
          className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-brand-400 hover:text-neutral-100"
        >
          {shareKey ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Built into share links so people skip the passcode. Regenerate to turn off every link you&apos;ve sent without
        changing the passcode or the table cards.
      </p>
    </div>
  );
};
