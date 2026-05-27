'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Venue, VenueRegion } from '@/types/wedding';

type RegionFilter = VenueRegion | 'all';

interface VenueFiltersProps {
  region: RegionFilter;
  onRegionChange: (region: RegionFilter) => void;
  counts: Record<RegionFilter, number>;
}

const REGION_OPTIONS: { value: RegionFilter; label: string }[] = [
  { value: 'all', label: 'All regions' },
  { value: 'west-michigan', label: 'West Michigan' },
  { value: 'detroit-metro', label: 'Detroit Metro' }
];

export const VenueFilters = ({ region, onRegionChange, counts }: VenueFiltersProps) => {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-neutral-400 mr-1">Region</span>
      {REGION_OPTIONS.map(opt => {
        const active = region === opt.value;
        const count = counts[opt.value] ?? 0;
        return (
          <button
            key={opt.value}
            onClick={() => onRegionChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              active
                ? 'bg-emerald-700 text-white border border-emerald-600'
                : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700'
            }`}
            type="button"
          >
            {opt.label} <span className="text-[10px] opacity-70">({count})</span>
          </button>
        );
      })}
    </div>
  );
};

const isRegionFilter = (v: string | null): v is RegionFilter =>
  v === 'all' || v === 'west-michigan' || v === 'detroit-metro' || v === 'other';

/**
 * Reads/writes the `?region=` URL param and returns the filtered venues plus the
 * current region and a setter that mutates the URL.
 */
export const useRegionFilter = (
  venues: Venue[]
): {
  region: RegionFilter;
  setRegion: (region: RegionFilter) => void;
  filtered: Venue[];
  counts: Record<RegionFilter, number>;
} => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regionParam = searchParams.get('region');
  const region: RegionFilter = isRegionFilter(regionParam) ? regionParam : 'all';
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  const setRegion = (next: RegionFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') {
      params.delete('region');
    } else {
      params.set('region', next);
    }
    router.replace(params.toString() ? `?${params.toString()}` : '?', { scroll: false });
  };

  const filtered = region === 'all' ? venues : venues.filter(v => v.region === region);

  const counts: Record<RegionFilter, number> = {
    all: venues.length,
    'west-michigan': venues.filter(v => v.region === 'west-michigan').length,
    'detroit-metro': venues.filter(v => v.region === 'detroit-metro').length,
    other: venues.filter(v => v.region === 'other').length
  };

  return { region, setRegion, filtered, counts };
};
