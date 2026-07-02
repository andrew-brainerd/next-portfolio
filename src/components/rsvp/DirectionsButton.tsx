import { mapsDirectionsUrl } from '@/utils/rsvp';

export const DirectionsButton = () => (
  <a
    href={mapsDirectionsUrl()}
    target="_blank"
    rel="noreferrer"
    className="rounded-lg border border-neutral-700 bg-neutral-900/50 px-4 py-2 text-neutral-100 transition-colors hover:bg-neutral-800"
  >
    📍 Get directions
  </a>
);
