'use client';

import { useState, useEffect, useRef } from 'react';

const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
const PLAYER_NAME = 'Peapod Web Player';

interface UseSpotifyPlayerOptions {
  accessToken: string | null;
  autoConnect?: boolean;
}

export function useSpotifyPlayer({ accessToken, autoConnect = true }: UseSpotifyPlayerOptions) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);

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
