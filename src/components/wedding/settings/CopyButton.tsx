'use client';

import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  label?: string;
}

export const CopyButton = ({ value, label = 'Copy' }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800"
    >
      {copied ? 'Copied' : label}
    </button>
  );
};
