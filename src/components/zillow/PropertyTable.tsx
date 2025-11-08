'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { ZillowProperty } from '@/types/zillow';

type SortField = keyof ZillowProperty;
type SortDirection = 'asc' | 'desc';

interface PropertyTableProps {
  properties: ZillowProperty[];
}

export default function PropertyTable({ properties }: PropertyTableProps) {
  const [sortField, setSortField] = useState<SortField>('updatedOn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleMouseEnter = (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(index);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredIndex(null);
  };

  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

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
  }, [properties, sortField, sortDirection]);

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

  const hoveredProperty = hoveredIndex !== null ? sortedProperties[hoveredIndex] : null;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-amber-50/85 rounded-lg overflow-hidden shadow-2xl backdrop-blur-sm">
          <thead className="bg-gradient-to-r from-orange-900 to-amber-800 text-amber-50">
            <tr>
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
                className="border-t border-amber-200 hover:bg-amber-200/60 transition-colors text-amber-950"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <td className="px-4 py-3">{property.address}</td>
                <td className="px-4 py-3">{formatCurrency(property.price)}</td>
                <td className="px-4 py-3">{property.beds}</td>
                <td className="px-4 py-3">{property.baths}</td>
                <td className="px-4 py-3">{property.sqft?.toLocaleString()}</td>
                <td className="px-4 py-3">
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
      {hoveredProperty?.image && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gradient-to-br from-orange-900 to-amber-800 p-2 rounded-lg shadow-2xl border-2 border-amber-600">
            <Image
              src={hoveredProperty.image}
              alt={hoveredProperty.address}
              width={600}
              height={450}
              className="rounded object-cover"
            />
          </div>
        </div>
      )}
    </>
  );
}
