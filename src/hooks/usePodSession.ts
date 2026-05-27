'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPod,
  updateCurrentlyPlaying,
  updatePodName as updatePodNameApi,
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
  startSession as startSessionApi,
  endSession,
  addTrackToSession
} from '@/api/peapod';
import {
  getSpotifyProfile,
  getMyDevices,
  getMyNowPlaying,
  play as spotifyPlay,
  pause as spotifyPause,
  skipToNext,
  seek as spotifySeek,
  transferPlayback as spotifyTransferPlayback
} from '@/api/spotifyClient';
import { getChannel } from '@/utils/pusher';
import { useSpotifyAuth, usePodConnection, useNowPlayingSync, usePeapodNotify } from '@/hooks/usePeapod';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import type { NowPlaying, Pod, SpotifyDevice, SpotifyProfile, SpotifyTrack } from '@/types/peapod';

export interface PodSession {
  pod: Pod | null;
  profile: SpotifyProfile | null;
  devices: SpotifyDevice[];
  displayNowPlaying: NowPlaying;
  favoriteTrackIds: Set<string>;
  activeSessionId: string | null;
  isPodOwner: boolean;
  isPlaying: boolean | undefined;
  isCurrentFavorited: boolean;
  nextInQueue: SpotifyTrack | undefined;
  currentTrackUri: string | undefined;
  updatePodName: (name: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  transferPlayback: (deviceId: string) => Promise<void>;
  playTrack: (track: SpotifyTrack) => Promise<void>;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  addToQueue: (track: SpotifyTrack) => Promise<void>;
  bulkAddToQueue: (tracks: SpotifyTrack[]) => Promise<void>;
  removeFromQueue: (track: SpotifyTrack) => Promise<void>;
  toggleFavorite: () => void;
  toggleFavoriteTrack: (track: SpotifyTrack) => Promise<void>;
}

export const usePodSession = (podId: string): PodSession => {
  const accessToken = useSpotifyAuth(s => s.accessToken);
  const displayNotification = usePeapodNotify(s => s.displayNotification);
  const { isConnected, setConnecting, setConnected, setDisconnected } = usePodConnection();
  const { nowPlaying: syncedNowPlaying, setNowPlaying: setSyncedNowPlaying } = useNowPlayingSync();

  const [pod, setPod] = useState<Pod | null>(null);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>({});
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<Set<string>>(new Set());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const prevTrackNameRef = useRef<string | undefined>(undefined);
  const prevTrackItemRef = useRef<SpotifyTrack | undefined>(undefined);
  const trackStartTimeRef = useRef<number>(0);
  const lastPlayedUriRef = useRef<string | null>(null);
  const sessionPlayedUrisRef = useRef<Set<string>>(new Set());
  const playNextDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingNextRef = useRef(false);
  const activeSessionIdRef = useRef<string | null>(null);
  const hasAttemptedResumeRef = useRef(false);
  const devicesRef = useRef<SpotifyDevice[]>([]);
  const displayItemRef = useRef<SpotifyTrack | undefined>(undefined);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  const handlePlayerStateChange = useCallback(
    (data: NowPlaying) => {
      setNowPlaying(data);
      const currentUri = data.item?.uri;

      if (currentUri) {
        updateCurrentlyPlaying(podId, currentUri);

        if (currentUri !== lastPlayedUriRef.current && activeSessionIdRef.current && data.item) {
          addTrackToSession(podId, activeSessionIdRef.current, data.item as SpotifyTrack);
        }

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

      if (playNextDebounceRef.current) clearTimeout(playNextDebounceRef.current);

      if (!data.is_playing && data.progress_ms === 0 && lastPlayedUriRef.current && !isPlayingNextRef.current) {
        playNextDebounceRef.current = setTimeout(() => {
          isPlayingNextRef.current = true;
          setPod(prev => {
            if (!prev) {
              isPlayingNextRef.current = false;
              return prev;
            }
            if (prev.queue.length > 0) {
              const nextTrack = prev.queue[0];
              spotifyPlay({ uris: [nextTrack.uri] }).finally(() => {
                isPlayingNextRef.current = false;
              });
            } else if (activeSessionIdRef.current) {
              getFavorites(podId).then(favData => {
                const favs = favData?.items || [];
                const unplayed = favs.filter(f => !sessionPlayedUrisRef.current.has(f.track.uri));
                if (unplayed.length > 0) {
                  const randomFav = unplayed[Math.floor(Math.random() * unplayed.length)];
                  spotifyPlay({ uris: [randomFav.track.uri] }).finally(() => {
                    isPlayingNextRef.current = false;
                  });
                } else {
                  isPlayingNextRef.current = false;
                }
              });
            } else {
              isPlayingNextRef.current = false;
            }
            return prev;
          });
        }, 500);
      } else if (data.is_playing) {
        isPlayingNextRef.current = false;
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
  const currentTrackUri = displayNowPlaying?.item?.uri;
  const isCurrentFavorited = !!currentTrackUri && favoriteTrackIds.has(currentTrackUri);
  const nextInQueue = pod?.queue?.[0];

  const fetchPod = useCallback(async () => {
    if (!accessToken) return;
    const data = await getPod(podId);
    if (data) setPod(data as Pod);
  }, [accessToken, podId]);

  useEffect(() => {
    if (!accessToken) return;
    getSpotifyProfile().then(setProfile);
  }, [accessToken]);

  useEffect(() => {
    const timeout = setTimeout(fetchPod, 0);
    const channel = getChannel(podId);
    channel.bind('podUpdated', fetchPod);
    return () => {
      clearTimeout(timeout);
      channel.unbind('podUpdated');
    };
  }, [fetchPod, podId]);

  useEffect(() => {
    if (accessToken && podId && profile) {
      addMemberToPod(podId, profile);
    }
  }, [accessToken, podId, profile]);

  useEffect(() => {
    if (!accessToken || !pod || !profile) return;

    if (isPodOwner && !isConnected) {
      setConnecting(podId);
      addActiveMemberToPod(podId, profile).then(() => setConnected());
    } else if (!isPodOwner && !isSyncing) {
      setConnecting(podId);
      addActiveMemberToPod(podId, profile).then(() => {
        setConnected();
        const channel = getChannel(podId);
        channel.bind('nowPlaying', (data: NowPlaying) => {
          setSyncedNowPlaying(data);
        });
        setIsSyncing(true);
      });
    }
  }, [accessToken, pod, profile, isPodOwner, isConnected, isSyncing, podId, setConnecting, setConnected, setSyncedNowPlaying]);

  useEffect(() => {
    if (!podId || !profile) return;
    const channel = getChannel(podId);
    channel.bind('memberAdded', () => fetchPod());
    return () => {
      channel.unbind('memberAdded');
    };
  }, [podId, profile, fetchPod]);

  useEffect(() => {
    if (!accessToken) return;
    getMyNowPlaying()
      .then(data => {
        if (data) setNowPlaying(data);
      })
      .catch(() => {});
  }, [accessToken, isPlayerReady]);

  useEffect(() => {
    if (!accessToken) return;
    getFavorites(podId)
      .then(data => {
        setFavoriteTrackIds(new Set((data?.items || []).map(f => f.trackId)));
      })
      .catch(() => {});
  }, [accessToken, podId]);

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

  useEffect(() => {
    if (!isPodOwner || !accessToken) return;
    getMyDevices().then(data => {
      if (data?.devices) setDevices(data.devices);
    });
  }, [isPodOwner, accessToken]);

  useEffect(() => {
    if (!isPlayerReady || !browserDeviceId) return;
    // Read latest devices via ref so changes to `devices` don't re-trigger transfer.
    const hasActiveDevice = devicesRef.current.some(d => d.is_active);
    if (!hasActiveDevice) {
      spotifyTransferPlayback([browserDeviceId], false)
        .catch(() => {})
        .then(() => {
          getMyDevices().then(data => {
            if (data?.devices) setDevices(data.devices);
          });
        });
    }
  }, [isPlayerReady, browserDeviceId]);

  useEffect(() => {
    if (hasAttemptedResumeRef.current) return;
    if (!isPodOwner || !isPlayerReady || !browserDeviceId || !nowPlaying?.item?.uri || !pod?.currentlyPlaying) return;
    const wasPlaying = sessionStorage.getItem(`pod_${podId}_playing`) === 'true';
    if (!wasPlaying) return;
    if (nowPlaying.item.uri !== pod.currentlyPlaying) return;
    if (nowPlaying.is_playing) return;
    hasAttemptedResumeRef.current = true;
    spotifyPlay().catch(() => {});
  }, [isPodOwner, isPlayerReady, browserDeviceId, nowPlaying, pod?.currentlyPlaying, podId]);

  useEffect(() => {
    if (accessToken && isPodOwner && nowPlaying && Object.keys(nowPlaying).length > 0) {
      pushNowPlayingToClients(podId, nowPlaying);
      sessionStorage.setItem(`pod_${podId}_playing`, String(!!nowPlaying.is_playing));
    }
  }, [accessToken, nowPlaying, isPodOwner, podId]);

  // Keep latest displayed item in a ref so the track-history effect can capture
  // it on a track change without re-running when the item reference churns.
  useEffect(() => {
    displayItemRef.current = displayNowPlaying?.item;
  });

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
    prevTrackItemRef.current = displayItemRef.current;
    trackStartTimeRef.current = Date.now();
  }, [trackName, isPodOwner, podId]);

  useEffect(() => {
    return () => {
      if (profile) {
        removeActiveMemberFromPod(podId, profile.id);
      }
      setDisconnected();
    };
  }, [podId, profile, setDisconnected]);

  const updatePodName = useCallback(
    async (name: string) => {
      if (!pod) return;
      await updatePodNameApi(podId, name);
      setPod({ ...pod, name });
    },
    [pod, podId]
  );

  const play = useCallback(async () => {
    try {
      if (browserDeviceId) {
        await spotifyTransferPlayback([browserDeviceId], true);
      } else {
        await spotifyPlay();
      }
    } catch {
      await spotifyPlay().catch(() => {});
    }
    const trackUri = displayNowPlaying?.item?.uri;
    if (trackUri) updateCurrentlyPlaying(podId, trackUri);
  }, [browserDeviceId, displayNowPlaying, podId]);

  const pause = useCallback(async () => {
    await spotifyPause();
  }, []);

  const next = useCallback(async () => {
    await skipToNext();
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    await spotifySeek(positionMs);
  }, []);

  const transferPlayback = useCallback(async (deviceId: string) => {
    await spotifyTransferPlayback([deviceId], true);
    setTimeout(() => {
      getMyDevices().then(data => {
        if (data?.devices) setDevices(data.devices);
      });
    }, 1500);
  }, []);

  const playTrack = useCallback(
    async (track: SpotifyTrack) => {
      if (browserDeviceId) {
        await spotifyTransferPlayback([browserDeviceId], false);
      }
      await spotifyPlay({ uris: [track.uri] });
      updateCurrentlyPlaying(podId, track.uri);
    },
    [browserDeviceId, podId]
  );

  const startSession = useCallback(async () => {
    sessionPlayedUrisRef.current = new Set();
    const session = await startSessionApi(podId);
    setActiveSessionId(session.id);
    if (browserDeviceId) {
      await spotifyTransferPlayback([browserDeviceId], false).catch(() => {});
    }
    const uris = pod?.queue?.map(t => t.uri) || [];
    if (uris.length > 0) {
      await spotifyPlay({ uris });
      if (uris[0]) updateCurrentlyPlaying(podId, uris[0]);
    } else {
      const favData = await getFavorites(podId);
      const favs = favData?.items || [];
      if (favs.length > 0) {
        const randomFav = favs[Math.floor(Math.random() * favs.length)];
        await spotifyPlay({ uris: [randomFav.track.uri] });
      }
    }
  }, [podId, browserDeviceId, pod?.queue]);

  const stopSession = useCallback(async () => {
    if (activeSessionId) {
      await endSession(podId, activeSessionId);
      setActiveSessionId(null);
    }
    sessionPlayedUrisRef.current = new Set();
    await spotifyPause();
  }, [activeSessionId, podId]);

  const addToQueue = useCallback(
    async (track: SpotifyTrack) => {
      if (!pod) return;
      if (pod.queue.some(t => t.uri === track.uri)) {
        displayNotification(`"${track.name}" is already in the queue`, { icon: 'info' });
        return;
      }
      setPod({ ...pod, queue: [...pod.queue, track] });
      displayNotification(`Added "${track.name}" to queue`, { icon: 'queue' });
      await addToPlayQueue(podId, track);
    },
    [pod, podId, displayNotification]
  );

  const bulkAddToQueue = useCallback(
    async (tracks: SpotifyTrack[]) => {
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
    },
    [pod, podId, displayNotification]
  );

  const removeFromQueue = useCallback(
    async (track: SpotifyTrack) => {
      if (!pod) return;
      setPod({ ...pod, queue: pod.queue.filter(t => t.uri !== track.uri) });
      await removeFromPlayQueue(podId, track);
    },
    [pod, podId]
  );

  const toggleFavoriteTrack = useCallback(
    async (track: SpotifyTrack) => {
      if (!profile) return;
      if (favoriteTrackIds.has(track.uri)) {
        await removeFavorite(podId, track.uri);
        setFavoriteTrackIds(prev => {
          const nextSet = new Set(prev);
          nextSet.delete(track.uri);
          return nextSet;
        });
      } else {
        await addFavorite(podId, track, profile.id);
        setFavoriteTrackIds(prev => new Set(prev).add(track.uri));
      }
    },
    [profile, favoriteTrackIds, podId]
  );

  const toggleFavorite = useCallback(() => {
    const track = displayNowPlaying?.item;
    if (track) toggleFavoriteTrack(track);
  }, [displayNowPlaying, toggleFavoriteTrack]);

  return {
    pod,
    profile,
    devices,
    displayNowPlaying,
    favoriteTrackIds,
    activeSessionId,
    isPodOwner,
    isPlaying,
    isCurrentFavorited,
    nextInQueue,
    currentTrackUri,
    updatePodName,
    play,
    pause,
    next,
    seek,
    transferPlayback,
    playTrack,
    startSession,
    stopSession,
    addToQueue,
    bulkAddToQueue,
    removeFromQueue,
    toggleFavorite,
    toggleFavoriteTrack
  };
};
