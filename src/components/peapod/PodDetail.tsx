'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSpotifyAuth, usePodConnection, useNowPlayingSync } from '@/hooks/usePeapod';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import {
  getPod,
  updatePodName,
  addMemberToPod,
  addActiveMemberToPod,
  removeActiveMemberFromPod,
  addToPlayHistory,
  pushNowPlayingToClients,
  getFavorites,
  addFavorite,
  removeFavorite
} from '@/api/peapod';
import {
  getSpotifyProfile,
  getMyDevices,
  getMyNowPlaying,
  play,
  pause,
  skipToNext,
  transferPlayback
} from '@/api/spotify-client';
import { getChannel } from '@/utils/pusher';
import SongSelection from './SongSelection';
import PodSidebar from './PodSidebar';
import PlayerBar from './PlayerBar';
import InviteModal from './InviteModal';
import DevicesModal from './DevicesModal';
import FavoritesModal from './FavoritesModal';
import MembersDisplay from './MembersDisplay';
import ArtistView from './ArtistView';
import AlbumView from './AlbumView';
import type { Pod, SpotifyProfile, SpotifyDevice, NowPlaying } from '@/types/peapod';

interface PodDetailProps {
  podId: string;
}

export default function PodDetail({ podId }: PodDetailProps) {
  const accessToken = useSpotifyAuth(s => s.accessToken);
  const { isConnected, setConnecting, setConnected, setDisconnected } = usePodConnection();
  const { nowPlaying: syncedNowPlaying, setNowPlaying: setSyncedNowPlaying } = useNowPlayingSync();

  const [pod, setPod] = useState<Pod | null>(null);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>({});
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [browseView, setBrowseView] = useState<{ type: 'artist' | 'album'; id: string } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const prevTrackNameRef = useRef<string | undefined>(undefined);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handlePlayerStateChange = useCallback((data: NowPlaying) => {
    setNowPlaying(data);
  }, []);

  const { deviceId: browserDeviceId, isReady: isPlayerReady } = useSpotifyPlayer({
    accessToken,
    onStateChange: handlePlayerStateChange
  });

  const isPodOwner = !!pod?.owner && !!profile?.id && pod.owner.id === profile.id;
  const displayNowPlaying = isPodOwner ? nowPlaying : syncedNowPlaying || nowPlaying;
  const isPlaying = displayNowPlaying?.is_playing;
  const trackName = displayNowPlaying?.item?.name;
  const albumArt = displayNowPlaying?.item?.album?.images?.[1]?.url;

  // Fetch pod data
  const fetchPod = useCallback(async () => {
    if (!accessToken) return;
    const data = await getPod(podId);
    if (data) setPod(data as Pod);
  }, [accessToken, podId]);

  // Fetch profile
  useEffect(() => {
    if (!accessToken) return;
    getSpotifyProfile().then(setProfile);
  }, [accessToken]);

  // Fetch pod on mount + listen for updates via Pusher
  useEffect(() => {
    const timeout = setTimeout(fetchPod, 0);
    const channel = getChannel(podId);
    channel.bind('podUpdated', fetchPod);
    return () => {
      clearTimeout(timeout);
      channel.unbind('podUpdated');
    };
  }, [fetchPod, podId]);

  // Auto-join pod as member
  useEffect(() => {
    if (accessToken && podId && profile) {
      addMemberToPod(podId, profile);
    }
  }, [accessToken, podId, profile]);

  // Connect as owner or client
  useEffect(() => {
    if (!accessToken || !pod || !profile) return;

    if (isPodOwner && !isConnected) {
      setConnecting(podId);
      addActiveMemberToPod(podId, profile).then(() => setConnected());
    } else if (!isPodOwner && !isSyncing) {
      setConnecting(podId);
      addActiveMemberToPod(podId, profile).then(() => {
        setConnected();
        // Subscribe to Pusher for client sync
        const channel = getChannel(podId);
        channel.bind('nowPlaying', (data: NowPlaying) => {
          setSyncedNowPlaying(data);
        });
        setIsSyncing(true);
      });
    }
  }, [accessToken, pod, profile, isPodOwner, isConnected, isSyncing, podId]);

  // Listen for member updates via Pusher
  useEffect(() => {
    if (!podId || !profile) return;
    const channel = getChannel(podId);
    channel.bind('memberAdded', () => fetchPod());
    return () => {
      channel.unbind('memberAdded');
    };
  }, [podId, profile, fetchPod]);

  // Fetch initial now playing state for owner
  useEffect(() => {
    if (!isPodOwner || !accessToken) return;
    getMyNowPlaying()
      .then(data => {
        if (data) setNowPlaying(data);
      })
      .catch(() => {});
  }, [isPodOwner, accessToken]);

  // Fetch favorites for pod
  useEffect(() => {
    if (!accessToken) return;
    getFavorites(podId)
      .then(data => {
        setFavoriteTrackIds(new Set((data?.items || []).map(f => f.trackId)));
      })
      .catch(() => {});
  }, [accessToken, podId]);

  // Fetch devices for owner
  useEffect(() => {
    if (!isPodOwner || !accessToken) return;
    getMyDevices().then(data => {
      if (data?.devices) setDevices(data.devices);
    });
  }, [isPodOwner, accessToken]);

  // Auto-transfer playback to browser device when SDK is ready if no active device (owner only)
  useEffect(() => {
    if (!isPodOwner || !isPlayerReady || !browserDeviceId) return;
    const hasActiveDevice = devices.some(d => d.is_active);
    if (!hasActiveDevice) {
      transferPlayback([browserDeviceId], false).then(() => {
        getMyDevices().then(data => {
          if (data?.devices) setDevices(data.devices);
        });
      });
    }
  }, [isPodOwner, isPlayerReady, browserDeviceId]);

  // Push now playing to clients when track changes (owner only)
  useEffect(() => {
    if (accessToken && isPodOwner && nowPlaying && Object.keys(nowPlaying).length > 0) {
      pushNowPlayingToClients(podId, nowPlaying);
    }
  }, [accessToken, nowPlaying, isPodOwner, podId]);

  // Track history on song change (owner only)
  useEffect(() => {
    if (
      prevTrackNameRef.current !== undefined &&
      prevTrackNameRef.current !== trackName &&
      isPodOwner &&
      trackName &&
      displayNowPlaying?.item
    ) {
      addToPlayHistory(podId, displayNowPlaying.item);
    }
    prevTrackNameRef.current = trackName;
  }, [trackName, isPodOwner, podId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (profile) {
        removeActiveMemberFromPod(podId, profile.id);
      }
      setDisconnected();
    };
  }, [podId, profile]);

  const currentTrackUri = displayNowPlaying?.item?.uri;
  const isCurrentFavorited = !!currentTrackUri && favoriteTrackIds.has(currentTrackUri);

  const handleToggleFavorite = async () => {
    const track = displayNowPlaying?.item;
    if (!track || !profile) return;

    if (isCurrentFavorited) {
      await removeFavorite(podId, track.uri);
      setFavoriteTrackIds(prev => {
        const next = new Set(prev);
        next.delete(track.uri);
        return next;
      });
    } else {
      await addFavorite(podId, track, profile.id);
      setFavoriteTrackIds(prev => new Set(prev).add(track.uri));
    }
  };

  const handlePlay = async () => {
    await play();
  };

  const handlePause = async () => {
    await pause();
  };

  const handleNext = async () => {
    await skipToNext();
  };

  const handleTransferPlayback = async (deviceId: string) => {
    await transferPlayback([deviceId], true);
    setTimeout(() => {
      getMyDevices().then(data => {
        if (data?.devices) setDevices(data.devices);
      });
    }, 1500);
  };

  const handleEditName = () => {
    setEditName(pod?.name || '');
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (trimmed && pod) {
      await updatePodName(podId, trimmed);
      setPod({ ...pod, name: trimmed });
    }
    setIsEditingName(false);
  };

  const handleStartPlaying = async () => {
    if (pod?.queue) {
      const uris = pod.queue.map(t => t.uri);
      await play({ uris });
    }
  };

  if (!pod) {
    return <div className="text-2xl mt-8 text-center">Loading Pod...</div>;
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-140px)] mx-auto max-w-5xl min-w-[375px] px-5 w-full">
        <div className="flex justify-between items-center py-1">
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
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  type="button"
                  aria-label="Cancel editing"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
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
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
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
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
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
              />
            ) : (
              <AlbumView
                albumId={browseView.id}
                podId={podId}
                userId={profile?.id}
                favoriteTrackIds={favoriteTrackIds}
                onBack={() => setBrowseView(null)}
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
            />
            <div className="flex-1 min-h-0 mt-2.5 overflow-y-auto pb-24">
              <PodSidebar
                queue={pod.queue || []}
                history={pod.history || []}
                isPodOwner={isPodOwner}
                onStartPlaying={handleStartPlaying}
              />
            </div>
          </>
        )}
      </div>
      <PlayerBar
        nowPlaying={displayNowPlaying}
        isPodOwner={isPodOwner}
        isFavorited={isCurrentFavorited}
        onPlay={handlePlay}
        onPause={handlePause}
        onNext={handleNext}
        onToggleFavorite={handleToggleFavorite}
      />
      <InviteModal isOpen={isInviteOpen} podId={podId} closeModal={() => setIsInviteOpen(false)} />
      <FavoritesModal isOpen={isFavoritesOpen} podId={podId} onClose={() => setIsFavoritesOpen(false)} />
      <DevicesModal
        isOpen={isDevicesOpen}
        devices={devices}
        onTransferPlayback={handleTransferPlayback}
        onClose={() => setIsDevicesOpen(false)}
      />
    </>
  );
}
