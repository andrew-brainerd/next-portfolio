'use client';

import { motion } from 'motion/react';
import TrackProgress from './TrackProgress';
import { PlayIcon, PauseIcon, NextIcon, HeartIcon } from './Icons';
import { formatArtistNames, getAlbumArtUrl } from '@/utils/peapod';
import type { NowPlaying, SpotifyTrack } from '@/types/peapod';

interface FullscreenPlayerProps {
  nowPlaying?: NowPlaying;
  nextInQueue?: SpotifyTrack;
  isPodOwner: boolean;
  isFavorited: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onSeek: (positionMs: number) => void;
  onToggleFavorite: () => void;
  onClose: () => void;
}

export default function FullscreenPlayer({
  nowPlaying,
  nextInQueue,
  isPodOwner,
  isFavorited,
  onPlay,
  onPause,
  onNext,
  onSeek,
  onToggleFavorite,
  onClose
}: FullscreenPlayerProps) {
  const isPlaying = nowPlaying?.is_playing;
  const track = nowPlaying?.item;
  const trackName = track?.name;
  const artistName = formatArtistNames(track?.artists);
  const albumName = track?.album?.name;
  const albumArt = track?.album?.images?.[0]?.url;
  const nextArt = nextInQueue ? getAlbumArtUrl(nextInQueue) : undefined;

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Background blur */}
      {albumArt && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110"
          style={{ backgroundImage: `url(${albumArt})` }}
        />
      )}

      <div
        className="relative z-10 flex flex-col items-center gap-6 max-w-lg w-full px-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Album art */}
        <motion.div
          className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {albumArt ? (
            <img className="w-full h-full object-cover" src={albumArt} alt="" />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600">
              <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </motion.div>

        {/* Track info */}
        <div className="text-center w-full">
          <div className="text-2xl font-bold text-white truncate">{trackName || 'No track playing'}</div>
          {artistName && <div className="text-base text-neutral-300 mt-1 truncate">{artistName}</div>}
          {albumName && <div className="text-sm text-neutral-500 mt-0.5 truncate">{albumName}</div>}
        </div>

        {/* Progress */}
        {trackName && (
          <div className="w-full">
            <TrackProgress nowPlaying={nowPlaying} onSeek={isPodOwner ? onSeek : undefined} />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            className={`transition-colors cursor-pointer ${isFavorited ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'}`}
            onClick={onToggleFavorite}
            type="button"
            aria-label="Favorite"
          >
            <HeartIcon size="w-7 h-7" fill={isFavorited ? 'currentColor' : 'none'} />
          </button>

          {isPodOwner && (
            <button
              className="text-white hover:text-brand-400 transition-colors cursor-pointer"
              onClick={isPlaying ? onPause : onPlay}
              type="button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon size="w-12 h-12" /> : <PlayIcon size="w-12 h-12" />}
            </button>
          )}

          {isPodOwner && (
            <button
              className="text-white hover:text-brand-400 transition-colors cursor-pointer"
              onClick={onNext}
              type="button"
              aria-label="Next"
            >
              <NextIcon size="w-7 h-7" />
            </button>
          )}
        </div>

        {/* Next in queue */}
        {nextInQueue && (
          <motion.div
            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {nextArt && <img className="w-8 h-8 rounded object-cover" src={nextArt} alt="" />}
            <div className="min-w-0">
              <div className="text-xs text-neutral-400">Up next</div>
              <div className="text-sm text-white truncate">{nextInQueue.name}</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Dismiss hint */}
      <div className="absolute bottom-6 text-neutral-600 text-xs">Click anywhere to dismiss</div>
    </motion.div>
  );
}
