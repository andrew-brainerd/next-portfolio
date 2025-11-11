'use client';

import { useState } from 'react';
import PropertyTable from './PropertyTable';
import PropertyMap from './PropertyMap';
import type { ZillowProperty } from '@/types/zillow';

interface PropertyViewsProps {
  properties: ZillowProperty[];
}

type ViewMode = 'table' | 'map';

export default function PropertyViews({ properties }: PropertyViewsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

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
