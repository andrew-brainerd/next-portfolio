'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Venue } from '@/types/wedding';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Greenhouse-themed leaf marker (matches the venue aesthetic the user is drawn to).
const venueIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path fill="#16a34a" stroke="#14532d" stroke-width="2" d="M12 0C7.589 0 4 3.589 4 8c0 6.5 8 14 8 14s8-7.5 8-14c0-4.411-3.589-8-8-8z"/>
      <path fill="#ecfccb" d="M12 4c-2.5 0-4 2-4 4 0 1.5 0.8 2.7 2 3.4-0.3-1 0-2.2 1-3 1-0.8 2.2-0.8 3-0.4-0.6-2.2-1.5-4-2-4z"/>
    </svg>
  `),
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48]
});

interface VenueMapProps {
  venues: Venue[];
  onOpenGallery?: (venue: Venue) => void;
}

export const VenueMap = ({ venues, onOpenGallery }: VenueMapProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  const placed = venues.filter((v): v is Venue & { coords: NonNullable<Venue['coords']> } => v.coords !== null);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] rounded-lg flex items-center justify-center border border-neutral-700 bg-neutral-900/40">
        <p className="text-neutral-400">Loading map…</p>
      </div>
    );
  }

  if (placed.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-lg flex items-center justify-center border border-neutral-700 bg-neutral-900/40">
        <p className="text-neutral-400">No venues with coordinates yet.</p>
      </div>
    );
  }

  // Center: roughly central-lower MI (Lansing-ish), zoom 7 fits the spread
  // from Saugatuck on Lake Michigan to Detroit.
  const center: [number, number] = [42.7, -84.5];

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-neutral-700">
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {placed.map(venue => (
          <Marker key={venue.slug} position={[venue.coords.lat, venue.coords.lng]} icon={venueIcon}>
            <Popup>
              <div className="p-1 min-w-[220px]">
                {venue.imageUrls?.[0] &&
                  (onOpenGallery ? (
                    <button
                      type="button"
                      onClick={() => onOpenGallery(venue)}
                      aria-label={`Open ${venue.name} image gallery`}
                      className="block w-full p-0 mb-2 rounded overflow-hidden cursor-zoom-in border-0 bg-transparent"
                    >
                      <img
                        src={venue.imageUrls[0]}
                        alt={venue.name}
                        width={220}
                        height={124}
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                    </button>
                  ) : (
                    <img
                      src={venue.imageUrls[0]}
                      alt={venue.name}
                      width={220}
                      height={124}
                      className="w-full h-32 object-cover rounded mb-2"
                      loading="lazy"
                    />
                  ))}
                <h3 className="font-bold text-neutral-900 mb-1">{venue.name}</h3>
                <p className="text-xs text-neutral-600 mb-2">{venue.city}</p>
                <div className="text-sm text-neutral-800 mb-2">
                  <div>
                    <span className="font-semibold">Price:</span> {venue.priceRange}
                  </div>
                  <div>
                    <span className="font-semibold">Capacity:</span>{' '}
                    {venue.capacity.min ? `${venue.capacity.min}–${venue.capacity.max}` : `≤ ${venue.capacity.max}`}
                  </div>
                </div>
                {venue.url && (
                  <a
                    href={venue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded text-sm font-semibold transition-colors"
                  >
                    Visit website
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
