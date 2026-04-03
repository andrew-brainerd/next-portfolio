'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import { getSpotifyAuthUrl } from '@/api/spotify-client';
import peapodLogo from '@/img/peapod-logo.png';

export default function SpotifyConnect() {
  const hasAuth = useSpotifyAuth(s => s.hasAuth);
  const loadLocalAuth = useSpotifyAuth(s => s.loadLocalAuth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadLocalAuth();
      setIsChecking(false);
    };
    init();
  }, [loadLocalAuth]);

  const handleConnect = async () => {
    const data = await getSpotifyAuthUrl();
    if (data?.authUrl) {
      // Save current path for redirect back
      localStorage.setItem('spotifyReturnUri', window.location.pathname);
      window.location.href = data.authUrl;
    }
  };

  if (isChecking) {
    return <div className="text-center py-10">Checking Spotify connection...</div>;
  }

  if (hasAuth()) return null;

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-6">
      <Image src={peapodLogo} alt="Peapod" width={96} height={96} />
      <p className="text-neutral-400 text-center max-w-md">
        Peapod needs access to your Spotify account to play music and sync with your pod members.
      </p>
      <button
        className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3 rounded-full transition-colors text-lg cursor-pointer"
        onClick={handleConnect}
        type="button"
      >
        Connect with Spotify
      </button>
    </div>
  );
}
