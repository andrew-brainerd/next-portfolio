'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PropertyTable from './PropertyTable';
import PropertyMap from './PropertyMap';
import type { ZillowProperty } from '@/types/zillow';

interface PropertyViewsProps {
  properties: ZillowProperty[];
}

type ViewMode = 'table' | 'map';

export default function PropertyViews({ properties }: PropertyViewsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const isInitialMount = useRef(true);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Initialize from URL param if valid, otherwise default to table
    return viewParam === 'map' || viewParam === 'table' ? viewParam : 'table';
  });

  useEffect(() => {
    // Skip updating URL on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Update URL when view mode changes from user interaction
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('view') !== viewMode) {
      params.set('view', viewMode);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [viewMode, router, searchParams]);

  return (
    <>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('table')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'table'
              ? 'bg-gradient-to-r from-orange-900 to-amber-800 text-amber-50 shadow-lg'
              : 'bg-amber-50/85 text-orange-900 hover:bg-amber-100/85 border border-amber-300'
          }`}
        >
          Table View
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'map'
              ? 'bg-gradient-to-r from-orange-900 to-amber-800 text-amber-50 shadow-lg'
              : 'bg-amber-50/85 text-orange-900 hover:bg-amber-100/85 border border-amber-300'
          }`}
        >
          Map View
        </button>
      </div>

      {viewMode === 'table' ? <PropertyTable properties={properties} /> : <PropertyMap properties={properties} />}
    </>
  );
}
