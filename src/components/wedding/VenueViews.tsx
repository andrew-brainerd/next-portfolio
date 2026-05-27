'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { VenueTable } from './VenueTable';
import { VenueMap } from './VenueMap';
import type { Venue } from '@/types/wedding';

// recharts is ~330KB — only ship it when the chart tab is selected.
const VenuePriceChart = dynamic(() => import('./VenuePriceChart').then(m => m.VenuePriceChart), { ssr: false });

type ViewMode = 'table' | 'map' | 'chart';

interface VenueViewsProps {
  venues: Venue[];
  budgetTarget: number;
}

const VIEW_LABEL: Record<ViewMode, string> = {
  table: 'Table',
  map: 'Map',
  chart: 'Price chart'
};

const isViewMode = (v: string | null): v is ViewMode => v === 'table' || v === 'map' || v === 'chart';

export const VenueViews = ({ venues, budgetTarget }: VenueViewsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const isInitialMount = useRef(true);

  const [viewMode, setViewMode] = useState<ViewMode>(() => (isViewMode(viewParam) ? viewParam : 'table'));

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('view') !== viewMode) {
      params.set('view', viewMode);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [viewMode, router, searchParams]);

  return (
    <>
      <div className="mb-6 flex gap-2">
        {(Object.keys(VIEW_LABEL) as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === mode
                ? 'bg-emerald-700 text-white shadow-lg'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
            }`}
            type="button"
          >
            {VIEW_LABEL[mode]}
          </button>
        ))}
      </div>

      {viewMode === 'table' && <VenueTable venues={venues} />}
      {viewMode === 'map' && <VenueMap venues={venues} />}
      {viewMode === 'chart' && <VenuePriceChart venues={venues} budgetTarget={budgetTarget} />}
    </>
  );
};
