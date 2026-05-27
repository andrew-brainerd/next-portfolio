'use client';

import type { Venue } from '@/types/wedding';
import { VenueFilters, useRegionFilter } from './VenueFilters';
import { VenueViewsWrapper } from './VenueViewsWrapper';
import { MobileVenueCards } from './MobileVenueCards';

interface WeddingShellProps {
  venues: Venue[];
  budgetTarget: number;
}

export const WeddingShell = ({ venues, budgetTarget }: WeddingShellProps) => {
  const { region, setRegion, filtered, counts } = useRegionFilter(venues);

  return (
    <>
      <VenueFilters region={region} onRegionChange={setRegion} counts={counts} />

      <div className="hidden md:block">
        <VenueViewsWrapper venues={filtered} budgetTarget={budgetTarget} />
      </div>

      <MobileVenueCards venues={filtered} />
    </>
  );
};
