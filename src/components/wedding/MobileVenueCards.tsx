'use client';

import type { Venue } from '@/types/wedding';
import { VenueCard } from './VenueCard';

interface MobileVenueCardsProps {
  venues: Venue[];
  onOpenGallery?: (venue: Venue) => void;
}

export const MobileVenueCards = ({ venues, onOpenGallery }: MobileVenueCardsProps) => {
  const sorted = [...venues].sort((a, b) => a.priceMidpoint - b.priceMidpoint);

  if (sorted.length === 0) {
    return (
      <div className="md:hidden rounded-lg border border-neutral-700 bg-neutral-900/40 p-6 text-center">
        <p className="text-neutral-400 text-sm">No venues match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="md:hidden flex flex-col gap-3">
      {sorted.map(venue => (
        <VenueCard key={venue.slug} venue={venue} onOpenGallery={onOpenGallery} />
      ))}
    </div>
  );
};
