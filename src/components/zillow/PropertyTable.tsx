'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import type { ZillowProperty } from '@/types/zillow';
import { getPropertyRank, setPropertyRank } from '@/api/propertyRankings';

type SortField = keyof ZillowProperty | 'rank';
type SortDirection = 'asc' | 'desc';

interface PropertyTableProps {
  properties: ZillowProperty[];
  isLoggedIn: boolean;
}

interface PropertyWithRank extends ZillowProperty {
  rank: number | null;
  commuteTime?: number | null;
}

export default function PropertyTable({ properties, isLoggedIn }: PropertyTableProps) {
  const [sortField, setSortField] = useState<SortField>(isLoggedIn ? 'rank' : 'updatedOn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [propertiesWithRanks, setPropertiesWithRanks] = useState<PropertyWithRank[]>([]);
  const [editingRank, setEditingRank] = useState<string | null>(null);
  const [rankInputValue, setRankInputValue] = useState<string>('');
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const handleImageMouseEnter = (image: string) => {
    setHoveredImage(image);
  };

  const handleImageMouseLeave = () => {
    setHoveredImage(null);
  };

  const sortedProperties = useMemo(() => {
    return [...propertiesWithRanks].sort((a, b) => {
      // Special handling for rank field
      if (sortField === 'rank') {
        const aRank = a.rank;
        const bRank = b.rank;

        if (aRank == null && bRank == null) return 0;
        if (aRank == null) return 1;
        if (bRank == null) return -1;

        return sortDirection === 'asc' ? aRank - bRank : bRank - aRank;
      }

      const aValue = a[sortField as keyof ZillowProperty];
      const bValue = b[sortField as keyof ZillowProperty];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [propertiesWithRanks, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-amber-300 ml-1">↕</span>;
    }
    return sortDirection === 'asc' ? (
      <span className="ml-1 text-amber-100">↑</span>
    ) : (
      <span className="ml-1 text-amber-100">↓</span>
    );
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? value : `$${num.toLocaleString()}`;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-amber-50/85 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm">
          <thead className="bg-gradient-to-r from-orange-900 to-amber-800 text-amber-50">
            <tr>
              {isLoggedIn && (
                <th
                  className="px-2 py-3 text-center cursor-pointer hover:bg-orange-950/80 transition-colors select-none w-20"
                  onClick={() => handleSort('rank')}
                >
                  Rank {getSortIcon('rank')}
                </th>
              )}
              <th className="px-4 py-3 text-left"></th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-orange-950/80 transition-colors select-none"
                onClick={() => handleSort('address')}
              >
                Address {getSortIcon('address')}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-orange-950/80 transition-colors select-none"
                onClick={() => handleSort('price')}
              >
                Rent {getSortIcon('price')}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-orange-950/80 transition-colors select-none"
                onClick={() => handleSort('beds')}
              >
                Beds {getSortIcon('beds')}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-orange-950/80 transition-colors select-none"
                onClick={() => handleSort('baths')}
              >
                Baths {getSortIcon('baths')}
              </th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:bg-orange-950/80 transition-colors select-none"
                onClick={() => handleSort('sqft')}
              >
                Sqft {getSortIcon('sqft')}
              </th>
              <th className="px-4 py-3 text-left">Link</th>
            </tr>
          </thead>
          <tbody>
            {sortedProperties.map((property, index) => (
              <tr
                key={`${property.address}-${index}`}
                className={`hover:bg-amber-200/60 transition-colors text-amber-950 ${
                  isLoggedIn && editingRank !== property.address ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (isLoggedIn && editingRank !== property.address) {
                    handleRankEdit(property.address, property.rank);
                  }
                }}
              >
                {isLoggedIn && (
                  <td className="px-2 py-3 text-center" onClick={e => e.stopPropagation()}>
                    {editingRank === property.address ? (
                      <div className="flex gap-1 justify-center">
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
                          className="w-12 px-1 py-1 border border-orange-300 rounded bg-white text-amber-950 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRankSave(property.address)}
                          className="px-1.5 py-1 bg-orange-700 text-amber-50 rounded text-xs hover:bg-orange-800 select-none cursor-pointer"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleRankCancel}
                          className="px-1.5 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 select-none cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold">{property.rank || '-'}</span>
                    )}
                  </td>
                )}
                <td className="px-2 py-3 text-center">
                  {property.image ? (
                    <div className="inline-block">
                      <Image
                        src={property.image}
                        alt={property.address}
                        width={100}
                        height={75}
                        className="rounded object-cover cursor-pointer"
                        onMouseEnter={() => handleImageMouseEnter(property.image)}
                        onMouseLeave={handleImageMouseLeave}
                      />
                    </div>
                  ) : (
                    <div className="w-[100px] h-[75px] bg-amber-200 rounded flex items-center justify-center text-xs text-amber-700 mx-auto">
                      No Image
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{property.address}</td>
                <td className="px-4 py-3">{formatCurrency(property.price)}</td>
                <td className="px-4 py-3">{property.beds}</td>
                <td className="px-4 py-3">{property.baths}</td>
                <td className="px-4 py-3">{property.sqft?.toLocaleString()}</td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <a
                    href={property.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-700 hover:text-orange-900 underline font-semibold"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image preview overlay - centered on page */}
      {hoveredImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/50">
          <Image
            src={hoveredImage}
            alt="Property preview"
            width={800}
            height={600}
            className="rounded-lg shadow-2xl object-cover max-w-[90vw] max-h-[90vh]"
          />
        </div>
      )}
    </>
  );
}
