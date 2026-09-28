'use client';

export const PrintButton = () => (
  <button
    type="button"
    onClick={() => window.print()}
    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-100 transition-colors hover:bg-neutral-700"
  >
    Print
  </button>
);
