'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSpotifyAuth, usePodConnection, useNowPlayingSync } from '@/hooks/usePeapod';
import {
  getPod,
  addMemberToPod,
  addActiveMemberToPod,
  removeActiveMemberFromPod,
  getSpotifyProfile,
  getMyDevices,
  getMyNowPlaying,
  addToPlayHistory,
  pushNowPlayingToClients,
  play,
  pause,
  transferPlayback
} from '@/api/peapod';
import { getChannel } from '@/utils/pusher';
import SongSelection from './SongSelection';
import OwnerPlayer from './OwnerPlayer';
import ClientPlayer from './ClientPlayer';
import PodSidebar from './PodSidebar';
import InviteModal from './InviteModal';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const prevTrackNameRef = useRef<string | undefined>(undefined);

  const isPodOwner = !!pod?.createdBy && !!profile?.id && pod.createdBy.id === profile.id;
  const displayNowPlaying = isPodOwner ? nowPlaying : syncedNowPlaying || nowPlaying;
  const isPlaying = displayNowPlaying?.is_playing;
  const trackName = displayNowPlaying?.item?.name;
  const albumArt = displayNowPlaying?.item?.album?.images?.[1]?.url;

  // Fetch pod data
  const fetchPod = useCallback(async () => {
    const data = await getPod(podId);
    if (data) setPod(data as Pod);
  }, [podId]);

  // Fetch profile
  useEffect(() => {
    if (!accessToken) return;
    getSpotifyProfile(accessToken).then(setProfile);
  }, [accessToken]);

  // Fetch pod on mount and periodically
  useEffect(() => {
    fetchPod();
    const interval = setInterval(fetchPod, 5000);
    return () => clearInterval(interval);
  }, [fetchPod]);

  // Auto-join pod as member
  useEffect(() => {
    if (podId && profile) {
      addMemberToPod(podId, profile);
    }
  }, [podId, profile]);

  // Connect as owner or client
  useEffect(() => {
    if (!pod || !profile) return;

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
  }, [pod, profile, isPodOwner, isConnected, isSyncing, podId]);

  // Listen for member updates via Pusher
  useEffect(() => {
    if (!podId || !profile) return;
    const channel = getChannel(podId);
    channel.bind('memberAdded', () => fetchPod());
    return () => {
      channel.unbind('memberAdded');
    };
  }, [podId, profile, fetchPod]);

  // Poll now playing for owner
  useEffect(() => {
    if (!isPodOwner || !accessToken) return;
    const fetchNowPlaying = async () => {
      try {
        const data = await getMyNowPlaying(accessToken);
        if (data) setNowPlaying(data);
      } catch {
        /* ignore */
      }
    };
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(interval);
  }, [isPodOwner, accessToken]);

  // Fetch devices for owner
  useEffect(() => {
    if (!isPodOwner || !accessToken) return;
    getMyDevices(accessToken).then(data => {
      if (data?.devices) setDevices(data.devices);
    });
  }, [isPodOwner, accessToken]);

  // Push now playing to clients when track changes (owner only)
  useEffect(() => {
    if (isPodOwner && nowPlaying && Object.keys(nowPlaying).length > 0) {
      pushNowPlayingToClients(podId, nowPlaying);
    }
  }, [nowPlaying, isPodOwner, podId]);

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

  const handlePlay = async () => {
    if (accessToken) await play(accessToken);
  };

  const handlePause = async () => {
    if (accessToken) await pause(accessToken);
  };

  const handleTransferPlayback = async (deviceId: string) => {
    if (accessToken) {
      await transferPlayback(accessToken, [deviceId], true);
      setTimeout(() => {
        getMyDevices(accessToken).then(data => {
          if (data?.devices) setDevices(data.devices);
        });
      }, 1500);
    }
  };

  const handleStartPlaying = async () => {
    if (accessToken && pod?.queue) {
      const uris = pod.queue.map(t => t.uri);
      await play(accessToken, { uris });
    }
  };

  if (!pod) {
    return <div className="text-2xl mt-8 text-center">Loading Pod...</div>;
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-140px)] mx-auto max-w-5xl min-w-[375px] px-5 w-full">
        <div className="flex justify-end py-1">
          <button
            className="bg-transparent flex items-center gap-1.5 py-1.5 px-3 rounded transition-colors hover:text-brand-400 cursor-pointer border-none text-white"
            onClick={() => setIsInviteOpen(true)}
            type="button"
          >
            <span>👥</span>
            <span className="text-sm">Invite</span>
          </button>
        </div>
        <SongSelection podId={podId} />
        <div className="flex flex-1 min-h-0 mt-2.5 max-md:flex-col">
          <div className="flex-1 min-w-0">
            {isPodOwner ? (
              <OwnerPlayer
                isPlaying={isPlaying}
                trackName={trackName}
                nowPlaying={displayNowPlaying}
                albumArt={albumArt}
                devices={devices}
                members={pod.members || []}
                activeMembers={pod.activeMembers || []}
                podCreatorId={pod.createdBy?.id}
                currentUserId={profile?.id}
                spotifyToken={accessToken || ''}
                onPlay={handlePlay}
                onPause={handlePause}
                onTransferPlayback={handleTransferPlayback}
              />
            ) : (
              <ClientPlayer
                isPlaying={isPlaying}
                trackName={trackName}
                nowPlaying={displayNowPlaying}
                albumArt={albumArt}
              />
            )}
          </div>
          <PodSidebar
            queue={pod.queue || []}
            history={pod.history || []}
            isPodOwner={isPodOwner}
            onStartPlaying={handleStartPlaying}
          />
        </div>
      </div>
      <InviteModal isOpen={isInviteOpen} podId={podId} closeModal={() => setIsInviteOpen(false)} />
    </>
  );
}
