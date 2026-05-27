'use client';

import { useState } from 'react';
import type { Venue } from '@/types/wedding';
import { VenueFilters, useRegionFilter } from './VenueFilters';
import { VenueViewsWrapper } from './VenueViewsWrapper';
import { MobileVenueCards } from './MobileVenueCards';
import { FullscreenCarousel } from './FullscreenCarousel';

interface WeddingShellProps {
  venues: Venue[];
  budgetTarget: number;
}

export const WeddingShell = ({ venues, budgetTarget }: WeddingShellProps) => {
  const { region, setRegion, filtered, counts } = useRegionFilter(venues);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // No-op if the venue has no images — keeps the click target honest.
  const openGallery = (venue: Venue) => {
    if (venue.imageUrls && venue.imageUrls.length > 0) {
      setSelectedVenue(venue);
    }
  };

  return (
    <>
      <VenueFilters region={region} onRegionChange={setRegion} counts={counts} />

      <div className="hidden md:block">
        <VenueViewsWrapper venues={filtered} budgetTarget={budgetTarget} onOpenGallery={openGallery} />
      </div>

      <MobileVenueCards venues={filtered} onOpenGallery={openGallery} />

      {selectedVenue && (
        <FullscreenCarousel
          key={selectedVenue.slug}
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      )}
    </>
  );
};
