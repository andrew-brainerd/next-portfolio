'use client';

import { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '@/api/peapod';
import Modal from './Modal';
import { CloseIcon } from './icons';
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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-neutral-800 rounded-xl p-6 max-w-md w-[90%] max-h-[70vh] flex flex-col">
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
                {fav.track.album?.images?.[2]?.url && (
                  <img
                    className="w-10 h-10 rounded flex-shrink-0 object-cover"
                    src={fav.track.album.images[2].url}
                    alt=""
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{fav.track.name}</div>
                  {fav.track.artists?.[0]?.name && (
                    <div className="text-xs text-neutral-400 truncate">
                      {fav.track.artists.map(a => a.name).join(', ')}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(fav.trackId)}
                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer flex-shrink-0"
                  type="button"
                  aria-label="Remove favorite"
                >
                  <CloseIcon size="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
