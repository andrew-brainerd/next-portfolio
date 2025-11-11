'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Image from 'next/image';
import type { ZillowProperty } from '@/types/zillow';
import { geocodeAddress } from '@/utils/geocoding';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create custom desert-themed marker icon
const customIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path fill="#c2410c" stroke="#7c2d12" stroke-width="2" d="M12 0C7.589 0 4 3.589 4 8c0 6.5 8 14 8 14s8-7.5 8-14c0-4.411-3.589-8-8-8z"/>
      <circle cx="12" cy="8" r="3" fill="#fcd34d"/>
    </svg>
  `),
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48]
});

interface PropertyWithCoords extends ZillowProperty {
  lat: number;
  lng: number;
}

interface PropertyMapProps {
  properties: ZillowProperty[];
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);
  const [propertiesWithCoords, setPropertiesWithCoords] = useState<PropertyWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCoordinates() {
      setLoading(true);
      setGeocodingError(null);

      try {
        const coordsPromises = properties.map(async property => {
          try {
            const coords = await geocodeAddress(property.address);
            return coords ? { ...property, ...coords } : null;
          } catch (error) {
            console.error(`Failed to geocode ${property.address}:`, error);
            return null;
          }
        });

        const results = await Promise.all(coordsPromises);

        if (!isCancelled) {
          const validResults = results.filter((p): p is PropertyWithCoords => p !== null);

          if (validResults.length === 0) {
            setGeocodingError(
              'Failed to geocode any property addresses. Please check your Google Maps API key configuration.'
            );
          } else {
            setPropertiesWithCoords(validResults);
          }
          setLoading(false);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading coordinates:', error);
          setGeocodingError('Google Maps geocoding service is unavailable. Please try again later.');
          setLoading(false);
        }
      }
    }

    loadCoordinates();

    return () => {
      isCancelled = true;
    };
  }, [properties]);

  useEffect(() => {
    // Add custom styles for Leaflet popups
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-popup-content-wrapper {
        background-color: rgba(255, 251, 235, 0.95);
        border: 2px solid #fcd34d;
        border-radius: 0.5rem;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
      }
      .leaflet-popup-tip {
        background-color: rgba(255, 251, 235, 0.95);
        border: 2px solid #fcd34d;
        border-top: none;
        border-right: none;
      }
      .leaflet-popup-close-button {
        color: #c2410c !important;
        font-size: 24px !important;
        font-weight: bold !important;
      }
      .leaflet-popup-close-button:hover {
        color: #7c2d12 !important;
      }
    `;
    document.head.appendChild(style);

    // Use requestAnimationFrame to defer setState and avoid cascading renders
    const rafId = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.head.removeChild(style);
    };
  }, []);

  if (!mounted || loading) {
    return (
      <div className="w-full h-[600px] bg-amber-50/85 rounded-lg flex items-center justify-center border-2 border-amber-300">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-900 mb-4"></div>
          <p className="text-orange-900 font-semibold">Loading property locations...</p>
        </div>
      </div>
    );
  }

  if (geocodingError) {
    return (
      <div className="w-full h-[600px] bg-red-50/85 rounded-lg flex items-center justify-center border-2 border-red-400">
        <div className="text-center p-6 max-w-md">
          <svg className="mx-auto h-12 w-12 text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-red-900 font-semibold mb-2">{geocodingError}</p>
          <p className="text-red-700 text-sm">Unable to display properties on the map.</p>
        </div>
      </div>
    );
  }

  // Center on Las Vegas
  const center: [number, number] = [36.1699, -115.1398];

  return (
    <div className="relative">
      <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-2xl border-2 border-amber-300">
        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} className="z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {propertiesWithCoords.map((property, index) => (
            <Marker key={`${property.address}-${index}`} position={[property.lat, property.lng]} icon={customIcon}>
              <Popup className="custom-popup">
                <div className="p-2 min-w-[250px]">
                  <h3 className="font-bold text-orange-900 mb-2">{property.address}</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-orange-700 font-semibold">Rent:</span>{' '}
                      <span className="text-amber-950">{property.price}</span>
                    </div>
                    <div>
                      <span className="text-orange-700 font-semibold">Beds:</span>{' '}
                      <span className="text-amber-950">{property.beds}</span> |
                      <span className="text-orange-700 font-semibold ml-2">Baths:</span>{' '}
                      <span className="text-amber-950">{property.baths}</span>
                    </div>
                    <div>
                      <span className="text-orange-700 font-semibold">Sqft:</span>{' '}
                      <span className="text-amber-950">{property.sqft?.toLocaleString()}</span>
                    </div>
                  </div>
                  {property.image && (
                    <Image
                      src={property.image}
                      alt={property.address}
                      width={250}
                      height={128}
                      className="w-full h-32 object-cover rounded mt-2 border border-amber-300"
                    />
                  )}
                  <a
                    href={property.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-center bg-orange-700 hover:bg-orange-800 text-amber-50 px-3 py-1.5 rounded text-sm font-semibold transition-colors"
                  >
                    View Listing
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
