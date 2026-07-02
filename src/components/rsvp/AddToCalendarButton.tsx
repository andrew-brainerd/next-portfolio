'use client';

import { downloadEventIcs } from '@/utils/rsvp';

export const AddToCalendarButton = () => (
  <button
    type="button"
    onClick={downloadEventIcs}
    className="cursor-pointer rounded-lg border border-neutral-700 bg-neutral-900/50 px-4 py-2 text-neutral-100 transition-colors hover:bg-neutral-800"
  >
    📅 Add to calendar
  </button>
);
