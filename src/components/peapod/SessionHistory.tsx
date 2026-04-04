'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getSessions } from '@/api/peapod';
import { getAlbumArtUrl, formatArtistNames } from '@/utils/peapod';
import type { PodSession, SpotifyTrack } from '@/types/peapod';
import Track from './Track';
import { PlusIcon, HeartIcon } from './Icons';

interface SessionHistoryProps {
  podId: string;
  favoriteTrackIds: Set<string>;
  onAddToQueue: (track: SpotifyTrack) => void;
  onToggleFavorite: (track: SpotifyTrack) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(start: string, end?: string): string {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export default function SessionHistory({ podId, favoriteTrackIds, onAddToQueue, onToggleFavorite }: SessionHistoryProps) {
  const [sessionList, setSessionList] = useState<PodSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      getSessions(podId)
        .then(data => setSessionList(data?.items || []))
        .finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timeout);
  }, [podId]);

  if (isLoading) {
    return <div className="text-neutral-400 text-center py-8 text-sm">Loading sessions...</div>;
  }

  if (sessionList.length === 0) {
    return <div className="text-neutral-400 text-center py-8 text-sm">No sessions yet</div>;
  }

  return (
    <div className="m-5">
      {sessionList.map((session, i) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
          className="bg-neutral-800 rounded-md mb-3 overflow-hidden"
        >
          <button
            onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
            className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-neutral-700 transition-colors"
            type="button"
          >
            <div>
              <div className="text-sm font-medium">
                {formatDate(session.startedAt)} at {formatTime(session.startedAt)}
              </div>
              <div className="text-xs text-neutral-400">
                {session.tracks.length} {session.tracks.length === 1 ? 'track' : 'tracks'}
                {' · '}
                {formatDuration(session.startedAt, session.endedAt)}
                {!session.endedAt && ' (active)'}
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-neutral-400 transition-transform ${expandedId === session.id ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {expandedId === session.id && (
            <div className="border-t border-neutral-700 px-2 pb-2">
              {session.tracks.length === 0 ? (
                <div className="text-neutral-500 text-xs text-center py-3">No tracks played</div>
              ) : (
                session.tracks.map((track: SpotifyTrack, j: number) => (
                  <div key={`${track.uri}-${j}`} className="group flex items-center">
                    <div className="flex-1 min-w-0">
                      <Track name={track.name} artists={track.artists} albumArt={getAlbumArtUrl(track)} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                      <button
                        onClick={() => onAddToQueue(track)}
                        className="text-neutral-400 hover:text-brand-400 transition-colors cursor-pointer p-2"
                        type="button"
                        aria-label="Add to queue"
                        title="Add to Queue"
                      >
                        <PlusIcon size="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onToggleFavorite(track)}
                        className={`transition-colors cursor-pointer p-2 ${favoriteTrackIds.has(track.uri) ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'}`}
                        type="button"
                        aria-label={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to favorites'}
                        title={favoriteTrackIds.has(track.uri) ? 'Favorited' : 'Add to Favorites'}
                      >
                        <HeartIcon size="w-5 h-5" fill={favoriteTrackIds.has(track.uri) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
