'use client';

import { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '@/api/peapod';
import type { PodFavorite } from '@/types/peapod';

interface FavoritesModalProps {
  isOpen: boolean;
  podId: string;
  onClose: () => void;
}

export default function FavoritesModal({ isOpen, podId, onClose }: FavoritesModalProps) {
  const [favorites, setFavorites] = useState<PodFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      setIsLoading(true);
      getFavorites(podId)
        .then(data => setFavorites(data?.items || []))
        .finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timeout);
  }, [isOpen, podId]);

  const handleRemove = async (trackId: string) => {
    await removeFavorite(podId, trackId);
    setFavorites(prev => prev.filter(f => f.trackId !== trackId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-neutral-800 rounded-xl p-6 max-w-md w-[90%] max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-xl mb-4 text-center">Favorites</div>
        {isLoading ? (
          <div className="text-neutral-400 text-center py-8">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="text-neutral-400 text-center py-8">No favorites yet</div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {favorites.map(fav => (
              <div
                key={fav.trackId}
                className="flex items-center gap-3 py-2.5 border-b border-neutral-700 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{fav.track.name}</div>
                  {fav.track.artist && <div className="text-xs text-neutral-400 truncate">{fav.track.artist}</div>}
                </div>
                <button
                  onClick={() => handleRemove(fav.trackId)}
                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer flex-shrink-0"
                  type="button"
                  aria-label="Remove favorite"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
