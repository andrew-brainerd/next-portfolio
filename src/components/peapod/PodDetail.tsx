'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { useSpotifyAuth, usePodConnection, useNowPlayingSync, usePeapodNotify } from '@/hooks/usePeapod';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import {
  getPod,
  updateCurrentlyPlaying,
  updatePodName,
  addMemberToPod,
  addActiveMemberToPod,
  removeActiveMemberFromPod,
  addToPlayHistory,
  pushNowPlayingToClients,
  addToPlayQueue,
  bulkAddToPlayQueue,
  removeFromPlayQueue,
  getFavorites,
  addFavorite,
  removeFavorite,
  getActiveSession,
  startSession,
  endSession,
  addTrackToSession
} from '@/api/peapod';
import {
  getSpotifyProfile,
  getMyDevices,
  getMyNowPlaying,
  play,
  pause,
  skipToNext,
  seek,
  transferPlayback
} from '@/api/spotifyClient';
import { getChannel } from '@/utils/pusher';
import SongSelection from './SongSelection';
import PodSidebar from './PodSidebar';
import PlayerBar from './PlayerBar';
import InviteModal from './InviteModal';
import DevicesModal from './DevicesModal';
import FavoritesModal from './FavoritesModal';
import FullscreenPlayer from './FullscreenPlayer';
import MembersDisplay from './MembersDisplay';
import PeapodLoader from './PeapodLoader';
import ArtistView from './ArtistView';
import AlbumView from './AlbumView';
import { CheckIcon, CloseIcon, PencilIcon, HeartIcon, PlayIcon } from './Icons';
import type { Pod, SpotifyProfile, SpotifyDevice, SpotifyTrack, NowPlaying } from '@/types/peapod';

interface PodDetailProps {
  podId: string;
}

export default function PodDetail({ podId }: PodDetailProps) {
  const accessToken = useSpotifyAuth(s => s.accessToken);
  const displayNotification = usePeapodNotify(s => s.displayNotification);
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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [browseView, setBrowseView] = useState<{ type: 'artist' | 'album'; id: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenAutoRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const prevTrackNameRef = useRef<string | undefined>(undefined);
  const prevTrackItemRef = useRef<SpotifyTrack | undefined>(undefined);
  const trackStartTimeRef = useRef<number>(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const lastPlayedUriRef = useRef<string | null>(null);
  const sessionPlayedUrisRef = useRef<Set<string>>(new Set());
  const activeSessionIdRef = useRef<string | null>(null);
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);

  const handlePlayerStateChange = useCallback(
    (data: NowPlaying) => {
      setNowPlaying(data);
      const currentUri = data.item?.uri;

      if (currentUri) {
        updateCurrentlyPlaying(podId, currentUri);

        // Record track to active session when a new track starts
        if (currentUri !== lastPlayedUriRef.current && activeSessionIdRef.current && data.item) {
          addTrackToSession(podId, activeSessionIdRef.current, data.item as SpotifyTrack);
        }

        // Remove track from queue when it starts playing
        setPod(prev => {
          if (!prev || !prev.queue.some(t => t.uri === currentUri)) return prev;
          const updatedQueue = prev.queue.filter(t => t.uri !== currentUri);
          removeFromPlayQueue(podId, data.item as SpotifyTrack);
          return { ...prev, queue: updatedQueue };
        });

        lastPlayedUriRef.current = currentUri;
        if (activeSessionIdRef.current) {
          sessionPlayedUrisRef.current.add(currentUri);
        }
      }

      // When playback stops (track ended), play next from queue or unplayed random favorite
      if (!data.is_playing && data.progress_ms === 0 && lastPlayedUriRef.current) {
        setPod(prev => {
          if (!prev) return prev;
          if (prev.queue.length > 0) {
            const nextTrack = prev.queue[0];
            play({ uris: [nextTrack.uri] });
          } else if (activeSessionIdRef.current) {
            getFavorites(podId).then(favData => {
              const favs = favData?.items || [];
              const unplayed = favs.filter(f => !sessionPlayedUrisRef.current.has(f.track.uri));
              if (unplayed.length > 0) {
                const randomFav = unplayed[Math.floor(Math.random() * unplayed.length)];
                play({ uris: [randomFav.track.uri] });
              }
            });
          }
          return prev;
        });
      }
    },
    [podId]
  );

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

  // Restore active session on mount
  useEffect(() => {
    if (!accessToken) return;
    getActiveSession(podId)
      .then(data => {
        if (data?.session) {
          setActiveSessionId(data.session.id);
          sessionPlayedUrisRef.current = new Set(data.session.tracks.map(t => t.uri));
        }
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
  // Resume playback if it was playing before refresh and the track is from this pod
  useEffect(() => {
    if (!isPodOwner || !isPlayerReady || !browserDeviceId) return;
    const wasPlaying = sessionStorage.getItem(`pod_${podId}_playing`) === 'true';
    const spotifyTrackUri = nowPlaying?.item?.uri;
    const isPodTrack = !!pod?.currentlyPlaying && spotifyTrackUri === pod.currentlyPlaying;
    const shouldResume = wasPlaying && isPodTrack;
    const hasActiveDevice = devices.some(d => d.is_active);
    if (!hasActiveDevice) {
      transferPlayback([browserDeviceId], shouldResume).then(() => {
        getMyDevices().then(data => {
          if (data?.devices) setDevices(data.devices);
        });
      });
    } else if (shouldResume) {
      play();
    }
  }, [isPodOwner, isPlayerReady, browserDeviceId]);

  // Push now playing to clients when track changes (owner only)
  useEffect(() => {
    if (accessToken && isPodOwner && nowPlaying && Object.keys(nowPlaying).length > 0) {
      pushNowPlayingToClients(podId, nowPlaying);
      sessionStorage.setItem(`pod_${podId}_playing`, String(!!nowPlaying.is_playing));
    }
  }, [accessToken, nowPlaying, isPodOwner, podId]);

  // Track history on song change (owner only), skip if played less than 30s
  useEffect(() => {
    if (
      prevTrackNameRef.current !== undefined &&
      prevTrackNameRef.current !== trackName &&
      isPodOwner &&
      prevTrackItemRef.current
    ) {
      const listenedMs = Date.now() - trackStartTimeRef.current;
      if (listenedMs >= 30000) {
        addToPlayHistory(podId, prevTrackItemRef.current);
      }
    }
    prevTrackNameRef.current = trackName;
    prevTrackItemRef.current = displayNowPlaying?.item;
    trackStartTimeRef.current = Date.now();
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

  // Auto-fullscreen after 15s idle while playing
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

  const currentTrackUri = displayNowPlaying?.item?.uri;
  const isCurrentFavorited = !!currentTrackUri && favoriteTrackIds.has(currentTrackUri);
  const nextInQueue = pod?.queue?.[0];

  const handleToggleFavoriteTrack = async (track: SpotifyTrack) => {
    if (!profile) return;

    if (favoriteTrackIds.has(track.uri)) {
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

  const handleToggleFavorite = () => {
    const track = displayNowPlaying?.item;
    if (track) handleToggleFavoriteTrack(track);
  };

  const handlePlay = async () => {
    try {
      if (browserDeviceId) {
        await transferPlayback([browserDeviceId], true);
      } else {
        await play();
      }
    } catch {
      // Transfer fails if nothing is playing — try direct play
      await play().catch(() => {});
    }
    const trackUri = displayNowPlaying?.item?.uri;
    if (trackUri) updateCurrentlyPlaying(podId, trackUri);
  };

  const handlePause = async () => {
    await pause();
  };

  const handleNext = async () => {
    await skipToNext();
  };

  const handleSeek = async (positionMs: number) => {
    await seek(positionMs);
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

  const handlePlayTrack = async (track: SpotifyTrack) => {
    if (browserDeviceId) {
      await transferPlayback([browserDeviceId], false);
    }
    await play({ uris: [track.uri] });
    updateCurrentlyPlaying(podId, track.uri);
  };

  const handleStartPlaying = async () => {
    sessionPlayedUrisRef.current = new Set();
    const session = await startSession(podId);
    setActiveSessionId(session.id);
    // Ensure browser device is active before playing
    if (browserDeviceId) {
      await transferPlayback([browserDeviceId], false).catch(() => {});
    }
    const uris = pod?.queue?.map(t => t.uri) || [];
    if (uris.length > 0) {
      await play({ uris });
      if (uris[0]) updateCurrentlyPlaying(podId, uris[0]);
    } else {
      // Queue empty — play random favorite
      const favData = await getFavorites(podId);
      const favs = favData?.items || [];
      if (favs.length > 0) {
        const randomFav = favs[Math.floor(Math.random() * favs.length)];
        await play({ uris: [randomFav.track.uri] });
      }
    }
  };

  const handleStopSession = async () => {
    if (activeSessionId) {
      await endSession(podId, activeSessionId);
      setActiveSessionId(null);
    }
    sessionPlayedUrisRef.current = new Set();
    await pause();
  };

  const handleAddToQueue = async (track: SpotifyTrack) => {
    if (!pod) return;
    if (pod.queue.some(t => t.uri === track.uri)) {
      displayNotification(`"${track.name}" is already in the queue`, { icon: 'info' });
      return;
    }
    setPod({ ...pod, queue: [...pod.queue, track] });
    displayNotification(`Added "${track.name}" to queue`, { icon: 'queue' });
    await addToPlayQueue(podId, track);
  };

  const handleBulkAddToQueue = async (tracks: SpotifyTrack[]) => {
    if (!pod) return;
    const existingUris = new Set(pod.queue.map(t => t.uri));
    const newTracks = tracks.filter(t => !existingUris.has(t.uri));
    if (newTracks.length === 0) {
      displayNotification('All tracks are already in the queue', { icon: 'info' });
      return;
    }
    setPod({ ...pod, queue: [...pod.queue, ...newTracks] });
    displayNotification(`Added ${newTracks.length} tracks to queue`, { icon: 'queue' });
    await bulkAddToPlayQueue(podId, newTracks);
  };

  const handleRemoveFromQueue = async (track: SpotifyTrack) => {
    if (!pod) return;
    setPod({ ...pod, queue: pod.queue.filter(t => t.uri !== track.uri) });
    await removeFromPlayQueue(podId, track);
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
            {isPodOwner && (
              activeSessionId ? (
                <div
                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  onClick={handleStopSession}
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
                  onClick={handleStartPlaying}
                  role="button"
                  title="Launch Pod"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              )
            )}
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
                onAddToQueue={handleAddToQueue}
              />
            ) : (
              <AlbumView
                albumId={browseView.id}
                podId={podId}
                userId={profile?.id}
                favoriteTrackIds={favoriteTrackIds}
                onBack={() => setBrowseView(null)}
                onAddToQueue={handleAddToQueue}
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
              onAddToQueue={handleAddToQueue}
              onPlayTrack={handlePlayTrack}
            />
            <div className="flex-1 min-h-0 mt-2.5 overflow-y-auto pb-24">
              <PodSidebar
                podId={podId}
                queue={pod.queue || []}
                history={pod.history || []}
                favoriteTrackIds={favoriteTrackIds}
                onRemoveFromQueue={handleRemoveFromQueue}
                onAddToQueue={handleAddToQueue}
                onToggleFavorite={handleToggleFavoriteTrack}
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
        onSeek={handleSeek}
        onFullscreen={() => { fullscreenAutoRef.current = false; setIsFullscreen(true); }}
      />
      <InviteModal isOpen={isInviteOpen} podId={podId} closeModal={() => setIsInviteOpen(false)} />
      <FavoritesModal isOpen={isFavoritesOpen} podId={podId} onClose={() => setIsFavoritesOpen(false)} onAddToQueue={handleAddToQueue} onBulkAddToQueue={handleBulkAddToQueue} />
      <DevicesModal
        isOpen={isDevicesOpen}
        devices={devices}
        onTransferPlayback={handleTransferPlayback}
        onClose={() => setIsDevicesOpen(false)}
      />
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenPlayer
            nowPlaying={displayNowPlaying}
            nextInQueue={nextInQueue}
            isPodOwner={isPodOwner}
            isFavorited={isCurrentFavorited}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handleNext}
            onSeek={handleSeek}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => setIsFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
