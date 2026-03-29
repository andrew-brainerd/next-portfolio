'use client';

import { useEffect, useState } from 'react';
import { useSpotifyAuth } from '@/hooks/usePeapod';
import { getSpotifyAuthUrl } from '@/api/peapod';

export default function SpotifyConnect() {
  const hasAuth = useSpotifyAuth(s => s.hasAuth);
  const loadLocalAuth = useSpotifyAuth(s => s.loadLocalAuth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    loadLocalAuth();
    setIsChecking(false);
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
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <h2 className="text-2xl font-bold">Connect Your Spotify Account</h2>
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
