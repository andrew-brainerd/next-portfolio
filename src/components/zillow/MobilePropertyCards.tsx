'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ZillowProperty } from '@/types/zillow';
import { getPropertyRank, setPropertyRank } from '@/api/propertyRankings';

interface MobilePropertyCardsProps {
  properties: ZillowProperty[];
  isLoggedIn: boolean;
}

interface PropertyWithRank extends ZillowProperty {
  rank: number | null;
}

export default function MobilePropertyCards({ properties, isLoggedIn }: MobilePropertyCardsProps) {
  const [propertiesWithRanks, setPropertiesWithRanks] = useState<PropertyWithRank[]>([]);
  const [editingRank, setEditingRank] = useState<string | null>(null);
  const [rankInputValue, setRankInputValue] = useState<string>('');

  useEffect(() => {
    // Load rankings from API for all properties
    async function loadRankings() {
      const propertiesWithRankData = await Promise.all(
        properties.map(async property => {
          const rank = await getPropertyRank(property.address);
          return { ...property, rank };
        })
      );
      setPropertiesWithRanks(propertiesWithRankData);
    }

    loadRankings();
  }, [properties]);

  // Split into ranked and backup properties
  const rankedProperties = [...propertiesWithRanks]
    .filter(p => p.rank != null)
    .sort((a, b) => (a.rank as number) - (b.rank as number));

  const backupProperties = propertiesWithRanks.filter(p => p.rank == null);

  const handleRankEdit = (address: string, currentRank: number | null) => {
    setEditingRank(address);
    setRankInputValue(currentRank !== null ? String(currentRank) : '');
  };

  const handleRankSave = async (address: string) => {
    const rank = parseInt(rankInputValue, 10);

    if (!isNaN(rank) && rank > 0) {
      try {
        const result = await setPropertyRank(address, rank);

        if (result.success) {
          setPropertiesWithRanks(prev => prev.map(p => (p.address === address ? { ...p, rank } : p)));
        } else {
          console.error('Failed to save rank:', result.error);
        }
      } catch (error) {
        console.error('Failed to save rank:', error);
      }
    }

    setEditingRank(null);
    setRankInputValue('');
  };

  const handleRankCancel = () => {
    setEditingRank(null);
    setRankInputValue('');
  };

  const renderPropertyCard = (property: PropertyWithRank, index: number, isBackup = false) => (
    <div
      key={`${isBackup ? 'backup-' : ''}${property.address}-${index}`}
      className={`bg-amber-50/85 rounded-lg p-4 hover:bg-amber-100/85 transition-colors shadow-lg backdrop-blur-sm ${
        isBackup ? 'border border-gray-400' : 'border border-amber-200'
      }`}
    >
      {/* Rank badge - always visible, editable only when logged in */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-orange-700">Rank:</span>
          {isLoggedIn && editingRank === property.address ? (
            <div className="flex gap-1">
              <input
                type="number"
                min="1"
                value={rankInputValue}
                onChange={e => setRankInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleRankSave(property.address);
                  } else if (e.key === 'Escape') {
                    handleRankCancel();
                  }
                }}
                className="w-16 px-2 py-1 border border-orange-300 rounded bg-white text-amber-950 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
              <button
                onClick={() => handleRankSave(property.address)}
                className="px-2 py-1 bg-orange-700 text-amber-50 rounded text-xs hover:bg-orange-800 select-none cursor-pointer"
              >
                ✓
              </button>
              <button
                onClick={handleRankCancel}
                className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 select-none cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : isLoggedIn ? (
            <button
              onClick={() => handleRankEdit(property.address, property.rank)}
              className={`px-3 py-1 ${
                isBackup ? 'bg-gray-600 hover:bg-gray-700' : 'bg-orange-700 hover:bg-orange-800'
              } text-amber-50 rounded-full text-sm font-bold transition-colors select-none cursor-pointer`}
            >
              {property.rank || '—'}
            </button>
          ) : (
            <span
              className={`px-3 py-1 ${isBackup ? 'bg-gray-600' : 'bg-orange-700'} text-amber-50 rounded-full text-sm font-bold`}
            >
              {property.rank || '—'}
            </span>
          )}
        </div>
      </div>

      {property.image && (
        <Image
          src={property.image}
          alt={property.address}
          width={800}
          height={400}
          className="w-full h-48 object-cover rounded-lg mb-4 border-2 border-amber-300"
        />
      )}
      <h2 className="text-xl font-semibold mb-2 text-orange-900">{property.address}</h2>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-orange-700">Rent:</span>{' '}
          <span className="font-semibold text-amber-950">{property.price}</span>
        </div>
        <div>
          <span className="text-orange-700">Sqft:</span>{' '}
          <span className="text-amber-950">{property.sqft?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-orange-700">Beds:</span> <span className="text-amber-950">{property.beds}</span>
        </div>
        <div>
          <span className="text-orange-700">Baths:</span> <span className="text-amber-950">{property.baths}</span>
        </div>
      </div>
      {property.amenities && property.amenities.length > 0 && (
        <div className="mb-3">
          <span className="text-orange-700 text-sm">Amenities:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {property.amenities.map((amenity, i) => (
              <span key={i} className="text-xs bg-orange-800 text-amber-50 px-2 py-1 rounded">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end items-center">
        <a
          href={property.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-700 hover:text-orange-900 underline text-sm font-semibold"
        >
          View Listing
        </a>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      {/* Ranked properties */}
      <div className="grid gap-4">{rankedProperties.map((property, index) => renderPropertyCard(property, index))}</div>

      {/* Backup properties */}
      {backupProperties.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-amber-100 mb-4">Backups</h3>
          <div className="grid gap-4">
            {backupProperties.map((property, index) => renderPropertyCard(property, index, true))}
          </div>
        </div>
      )}
    </div>
  );
}
