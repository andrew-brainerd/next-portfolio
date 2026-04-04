'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { SpotifyTrack } from '@/types/peapod';
import { getAlbumArtUrl } from '@/utils/peapod';
import Track from './Track';
import { CloseIcon, HeartIcon } from './Icons';

interface PlayQueueProps {
  queue: SpotifyTrack[];
  favoriteTrackIds: Set<string>;
  onRemove: (track: SpotifyTrack) => void;
  onToggleFavorite: (track: SpotifyTrack) => void;
}

export default function PlayQueue({ queue, favoriteTrackIds, onRemove, onToggleFavorite }: PlayQueueProps) {
  return (
    <div className="m-5 overflow-y-auto">
      <AnimatePresence initial={false}>
        {[...queue].map((track: SpotifyTrack) => (
          <motion.div
            key={track.uri}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="group flex items-center bg-neutral-800 rounded-md mx-auto my-2.5 overflow-hidden"
          >
            <div className="flex-1 min-w-0 p-4">
              <Track name={track.name} artists={track.artists} albumArt={getAlbumArtUrl(track)} />
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
              <button
                onClick={() => onToggleFavorite(track)}
                className={`transition-colors cursor-pointer p-2 ${favoriteTrackIds.has(track.uri) ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'}`}
                type="button"
                aria-label={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to favorites'}
              >
                <HeartIcon fill={favoriteTrackIds.has(track.uri) ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => onRemove(track)}
                className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer p-2"
                type="button"
                aria-label="Remove from queue"
              >
                <CloseIcon size="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
