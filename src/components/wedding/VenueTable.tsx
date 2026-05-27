'use client';

import { useState, useMemo } from 'react';
import type { Venue } from '@/types/wedding';

type SortField = 'name' | 'city' | 'region' | 'category' | 'priceMidpoint' | 'capacityMax';
type SortDirection = 'asc' | 'desc';

interface VenueTableProps {
  venues: Venue[];
  onOpenGallery?: (venue: Venue) => void;
}

const REGION_LABEL: Record<Venue['region'], string> = {
  'west-michigan': 'West Michigan',
  'detroit-metro': 'Detroit Metro',
  other: 'Other'
};

const CATEGORY_LABEL: Record<Venue['category'], string> = {
  greenhouse: 'Greenhouse',
  'glass-nature': 'Glass + Nature',
  'urban-loft': 'Urban Loft',
  'historic-ballroom': 'Historic Ballroom'
};

const compare = (a: number | string, b: number | string, dir: SortDirection) => {
  if (a === b) return 0;
  const cmp = a < b ? -1 : 1;
  return dir === 'asc' ? cmp : -cmp;
};

const fieldValue = (venue: Venue, field: SortField): string | number => {
  switch (field) {
    case 'name':
      return venue.name.toLowerCase();
    case 'city':
      return venue.city.toLowerCase();
    case 'region':
      return REGION_LABEL[venue.region];
    case 'category':
      return CATEGORY_LABEL[venue.category];
    case 'priceMidpoint':
      return venue.priceMidpoint;
    case 'capacityMax':
      return venue.capacity.max;
  }
};

export const VenueTable = ({ venues, onOpenGallery }: VenueTableProps) => {
  const [sortField, setSortField] = useState<SortField>('priceMidpoint');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sorted = useMemo(() => {
    return [...venues].sort((a, b) => compare(fieldValue(a, sortField), fieldValue(b, sortField), sortDirection));
  }, [venues, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const arrow = (field: SortField) => (sortField === field ? (sortDirection === 'asc' ? '▲' : '▼') : '');

  const headerClass =
    'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-300 cursor-pointer select-none hover:text-white transition-colors';

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-700 bg-neutral-900/40">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-800/80">
          <tr>
            <th className="w-16 px-3 py-2"></th>
            <th className={headerClass} onClick={() => handleSort('name')}>
              Venue {arrow('name')}
            </th>
            <th className={headerClass} onClick={() => handleSort('city')}>
              City {arrow('city')}
            </th>
            <th className={headerClass} onClick={() => handleSort('region')}>
              Region {arrow('region')}
            </th>
            <th className={headerClass} onClick={() => handleSort('category')}>
              Category {arrow('category')}
            </th>
            <th className={`${headerClass} text-right`} onClick={() => handleSort('priceMidpoint')}>
              Price {arrow('priceMidpoint')}
            </th>
            <th className={`${headerClass} text-right`} onClick={() => handleSort('capacityMax')}>
              Capacity {arrow('capacityMax')}
            </th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-300">
              Features
            </th>
            <th className="w-12 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-300">
              Site
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((venue, i) => {
            const hasImages = !!venue.imageUrls?.length;
            const clickable = hasImages && !!onOpenGallery;
            return (
              <tr
                key={venue.slug}
                onClick={clickable ? () => onOpenGallery!(venue) : undefined}
                className={`border-t border-neutral-700/60 ${i % 2 === 0 ? 'bg-neutral-900/20' : 'bg-neutral-800/20'} hover:bg-neutral-700/40 transition-colors ${clickable ? 'cursor-pointer' : ''}`}
              >
                <td className="px-3 py-3">
                  {venue.imageUrls?.[0] ? (
                    <img
                      src={venue.imageUrls[0]}
                      alt=""
                      width={48}
                      height={36}
                      className="w-12 h-9 rounded object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-9 rounded bg-neutral-700/50" />
                  )}
                </td>
                <td className="px-3 py-3 font-medium text-white">{venue.name}</td>
                <td className="px-3 py-3 text-neutral-300">{venue.city}</td>
                <td className="px-3 py-3 text-neutral-300">{REGION_LABEL[venue.region]}</td>
                <td className="px-3 py-3 text-neutral-300">{CATEGORY_LABEL[venue.category]}</td>
                <td className="px-3 py-3 text-right text-neutral-200 whitespace-nowrap" title={venue.priceRange}>
                  {venue.priceRange}
                </td>
                <td className="px-3 py-3 text-right text-neutral-200 whitespace-nowrap">
                  {venue.capacity.min ? `${venue.capacity.min}–${venue.capacity.max}` : `≤ ${venue.capacity.max}`}
                </td>
                <td className="px-3 py-3 text-neutral-400">
                  <div className="flex flex-wrap gap-1">
                    {venue.features.map(f => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-full bg-neutral-700/60 text-xs text-neutral-200 whitespace-nowrap"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                  {venue.url ? (
                    <a
                      href={venue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${venue.name} website`}
                      className="inline-flex items-center justify-center w-7 h-7 rounded text-neutral-400 hover:text-brand-400 hover:bg-neutral-700/40 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
