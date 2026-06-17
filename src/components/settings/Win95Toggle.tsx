'use client';

import { useWin95Mode } from '@/hooks/useWin95Mode';

export const Win95Toggle = () => {
  const { enabled, toggle } = useWin95Mode();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className={`flex w-full items-center justify-between gap-4 rounded-lg border-2 p-4 text-left transition-all cursor-pointer ${
        enabled
          ? 'border-brand-500 bg-neutral-700/50'
          : 'border-neutral-500 bg-neutral-700/30 hover:border-neutral-400'
      }`}
    >
      <span>
        <span className="block text-sm font-medium">Windows 95 mode</span>
        <span className="block text-xs text-neutral-300">
          Reskin the whole site with a Start menu, taskbar, and window chrome.
        </span>
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          enabled ? 'bg-brand-500' : 'bg-neutral-500'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
};
