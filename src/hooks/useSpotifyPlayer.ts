'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { NowPlaying } from '@/types/peapod';

const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
const PLAYER_NAME = 'Peapod Web Player';

function mapToNowPlaying(state: WebPlaybackState): NowPlaying {
  const track = state.track_window.current_track;
  return {
    is_playing: !state.paused,
    progress_ms: state.position,
    item: {
      uri: track.uri,
      name: track.name,
      artists: track.artists.map(a => ({ name: a.name })),
      album: {
        name: track.album.name,
        images: track.album.images.map(img => ({ url: img.url, height: 0, width: 0 }))
      },
      duration_ms: state.duration,
      preview_url: null
    }
  };
}

interface UseSpotifyPlayerOptions {
  accessToken: string | null;
  autoConnect?: boolean;
  onStateChange?: (nowPlaying: NowPlaying) => void;
}

export function useSpotifyPlayer({ accessToken, autoConnect = true, onStateChange }: UseSpotifyPlayerOptions) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    if (!accessToken || !autoConnect) return;

    // Load the SDK script if not already loaded
    if (!document.querySelector(`script[src="${SDK_URL}"]`)) {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      document.body.appendChild(script);
    }

    const initPlayer = () => {
      const player = new window.Spotify.Player({
        name: PLAYER_NAME,
        getOAuthToken: cb => cb(accessToken),
        volume: 0.5
      });

      player.addListener('ready', (data: Record<string, unknown>) => {
        const id = data.device_id as string;
        setDeviceId(id);
        setIsReady(true);
      });

      player.addListener('not_ready', () => {
        setIsReady(false);
        setDeviceId(null);
      });

      player.addListener('player_state_changed', (state: Record<string, unknown>) => {
        if (state && onStateChangeRef.current) {
          onStateChangeRef.current(mapToNowPlaying(state as unknown as WebPlaybackState));
        }
      });

      player.connect();
      playerRef.current = player;
    };

    // If SDK is already loaded, init immediately
    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        setIsReady(false);
        setDeviceId(null);
      }
    };
  }, [accessToken, autoConnect]);

  return { deviceId, isReady };
}
