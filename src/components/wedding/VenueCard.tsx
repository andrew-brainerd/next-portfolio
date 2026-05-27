import type { Venue } from '@/types/wedding';
import { VenueCarousel } from './VenueCarousel';

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

const CATEGORY_TINT: Record<Venue['category'], string> = {
  greenhouse: 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50',
  'glass-nature': 'bg-teal-900/40 text-teal-200 border-teal-700/50',
  'urban-loft': 'bg-amber-900/40 text-amber-200 border-amber-700/50',
  'historic-ballroom': 'bg-violet-900/40 text-violet-200 border-violet-700/50'
};

interface VenueCardProps {
  venue: Venue;
}

export const VenueCard = ({ venue }: VenueCardProps) => {
  const images = venue.imageUrls ?? [];
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/40 p-4 shadow-md overflow-hidden">
      {images.length > 0 && <VenueCarousel images={images} alt={venue.name} />}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{venue.name}</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            {venue.city} · {REGION_LABEL[venue.region]}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full border text-[10px] font-medium whitespace-nowrap ${CATEGORY_TINT[venue.category]}`}
        >
          {CATEGORY_LABEL[venue.category]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-neutral-500">Price</p>
          <p className="text-neutral-100 font-medium">{venue.priceRange}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-neutral-500">Capacity</p>
          <p className="text-neutral-100 font-medium">
            {venue.capacity.min ? `${venue.capacity.min}–${venue.capacity.max}` : `≤ ${venue.capacity.max}`}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-400 leading-relaxed">{venue.description}</p>

      {venue.features.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {venue.features.map(f => (
            <span
              key={f}
              className="px-2 py-0.5 rounded-full bg-neutral-700/60 text-[10px] text-neutral-300 whitespace-nowrap"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {venue.url && (
        <a
          href={venue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded text-sm font-semibold transition-colors"
        >
          Visit website
        </a>
      )}
    </div>
  );
};
