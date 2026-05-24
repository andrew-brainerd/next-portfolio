'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { usePodSession } from '@/hooks/usePodSession';
import { SongSelection } from './SongSelection';
import { PodSidebar } from './PodSidebar';
import { PlayerBar } from './PlayerBar';
import { InviteModal } from './InviteModal';
import { DevicesModal } from './DevicesModal';
import { FavoritesModal } from './FavoritesModal';
import { FullscreenPlayer } from './FullscreenPlayer';
import { MembersDisplay } from './MembersDisplay';
import { PeapodLoader } from './PeapodLoader';
import { ArtistView } from './ArtistView';
import { AlbumView } from './AlbumView';
import { CheckIcon, CloseIcon, PencilIcon, HeartIcon } from './Icons';

interface PodDetailProps {
  podId: string;
}

export const PodDetail = ({ podId }: PodDetailProps) => {
  const session = usePodSession(podId);
  const {
    pod,
    profile,
    devices,
    displayNowPlaying,
    favoriteTrackIds,
    activeSessionId,
    isPodOwner,
    isPlaying,
    isCurrentFavorited,
    nextInQueue
  } = session;

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [browseView, setBrowseView] = useState<{ type: 'artist' | 'album'; id: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  const fullscreenAutoRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dismissIfAuto = () => {
      if (isFullscreen && fullscreenAutoRef.current) {
        setIsFullscreen(false);
        fullscreenAutoRef.current = false;
      }
    };

    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      dismissIfAuto();
      if (!isPlaying) return;
      idleTimerRef.current = setTimeout(() => {
        fullscreenAutoRef.current = true;
        setIsFullscreen(true);
      }, 15000);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => document.addEventListener(e, resetIdle));
    if (!isFullscreen) resetIdle();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(e => document.removeEventListener(e, resetIdle));
    };
  }, [isPlaying, isFullscreen]);

  const handleEditName = () => {
    setEditName(pod?.name || '');
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (trimmed) {
      await session.updatePodName(trimmed);
    }
    setIsEditingName(false);
  };

  if (!pod) {
    return <PeapodLoader text="Loading Pod..." />;
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-140px)] mx-auto max-w-5xl min-w-[375px] px-5 w-full">
        <div className="flex justify-between items-center py-1 mb-4">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <>
                <input
                  ref={nameInputRef}
                  className="bg-transparent border-b border-brand-400 text-2xl font-bold text-white outline-none px-1"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                />
                <button
                  onClick={handleSaveName}
                  className="text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                  type="button"
                  aria-label="Save name"
                >
                  <CheckIcon size="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  type="button"
                  aria-label="Cancel editing"
                >
                  <CloseIcon size="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="group flex items-center gap-2">
                <h1 className="text-2xl font-bold">{pod.name || 'Untitled Pod'}</h1>
                {isPodOwner && (
                  <button
                    onClick={handleEditName}
                    className="text-neutral-400 hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    type="button"
                    aria-label="Edit pod name"
                  >
                    <PencilIcon size="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <MembersDisplay
              members={pod.members || []}
              activeMembers={pod.activeMembers || []}
              podCreatorId={pod.owner?.id}
              currentUserId={profile?.id}
            />
            {isPodOwner &&
              (activeSessionId ? (
                <div
                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  onClick={session.stopSession}
                  role="button"
                  title="Stop Pod"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                </div>
              ) : (
                <div
                  className="text-neutral-400 hover:text-brand-400 transition-colors cursor-pointer"
                  onClick={session.startSession}
                  role="button"
                  title="Launch Pod"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              ))}
            {isPodOwner && (
              <button
                className="text-neutral-400 hover:text-brand-400 transition-colors cursor-pointer"
                onClick={() => setIsDevicesOpen(true)}
                type="button"
                aria-label="Devices"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </button>
            )}
            <button
              className="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
              onClick={() => setIsFavoritesOpen(true)}
              type="button"
              aria-label="Favorites"
            >
              <HeartIcon />
            </button>
            <button
              className="text-neutral-400 hover:text-brand-400 transition-colors cursor-pointer"
              onClick={() => setIsInviteOpen(true)}
              type="button"
              aria-label="Invite"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </button>
          </div>
        </div>
        {browseView ? (
          <div className="flex-1 min-h-0 mt-2.5 overflow-y-auto pb-24">
            {browseView.type === 'artist' ? (
              <ArtistView
                artistId={browseView.id}
                podId={podId}
                userId={profile?.id}
                favoriteTrackIds={favoriteTrackIds}
                onBack={() => setBrowseView(null)}
                onAlbumSelect={albumId => setBrowseView({ type: 'album', id: albumId })}
                onAddToQueue={session.addToQueue}
              />
            ) : (
              <AlbumView
                albumId={browseView.id}
                podId={podId}
                userId={profile?.id}
                favoriteTrackIds={favoriteTrackIds}
                onBack={() => setBrowseView(null)}
                onAddToQueue={session.addToQueue}
              />
            )}
          </div>
        ) : (
          <>
            <SongSelection
              podId={podId}
              userId={profile?.id}
              onArtistSelect={artistId => setBrowseView({ type: 'artist', id: artistId })}
              onAlbumSelect={albumId => setBrowseView({ type: 'album', id: albumId })}
              onAddToQueue={session.addToQueue}
              onPlayTrack={session.playTrack}
            />
            <div className="flex-1 min-h-0 mt-2.5 overflow-y-auto pb-24">
              <PodSidebar
                podId={podId}
                queue={pod.queue || []}
                history={pod.history || []}
                favoriteTrackIds={favoriteTrackIds}
                onRemoveFromQueue={session.removeFromQueue}
                onAddToQueue={session.addToQueue}
                onToggleFavorite={session.toggleFavoriteTrack}
              />
            </div>
          </>
        )}
      </div>
      <PlayerBar
        nowPlaying={displayNowPlaying}
        isPodOwner={isPodOwner}
        isFavorited={isCurrentFavorited}
        onPlay={session.play}
        onPause={session.pause}
        onNext={session.next}
        onToggleFavorite={session.toggleFavorite}
        onSeek={session.seek}
        onFullscreen={() => {
          fullscreenAutoRef.current = false;
          setIsFullscreen(true);
        }}
      />
      <InviteModal isOpen={isInviteOpen} podId={podId} closeModal={() => setIsInviteOpen(false)} />
      <FavoritesModal
        isOpen={isFavoritesOpen}
        podId={podId}
        onClose={() => setIsFavoritesOpen(false)}
        onAddToQueue={session.addToQueue}
        onBulkAddToQueue={session.bulkAddToQueue}
      />
      <DevicesModal
        isOpen={isDevicesOpen}
        devices={devices}
        onTransferPlayback={session.transferPlayback}
        onClose={() => setIsDevicesOpen(false)}
      />
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenPlayer
            nowPlaying={displayNowPlaying}
            nextInQueue={nextInQueue}
            isPodOwner={isPodOwner}
            isFavorited={isCurrentFavorited}
            onPlay={session.play}
            onPause={session.pause}
            onNext={session.next}
            onSeek={session.seek}
            onToggleFavorite={session.toggleFavorite}
            onClose={() => setIsFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
