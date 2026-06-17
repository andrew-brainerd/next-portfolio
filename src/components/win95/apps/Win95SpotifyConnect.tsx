'use client';

import Image from 'next/image';
import { getSpotifyAuthUrl } from '@/api/spotifyClient';
import peapodLogo from '@/img/peapod-logo.png';

export const Win95SpotifyConnect = () => {
  const handleConnect = async () => {
    const data = await getSpotifyAuthUrl();
    if (data?.authUrl) {
      localStorage.setItem('spotifyReturnUri', window.location.pathname);
      window.location.href = data.authUrl;
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-[11px]">
      <div className="win95-raised flex max-w-sm flex-col items-center gap-3 p-5">
        <Image src={peapodLogo} alt="Peapod" width={64} height={64} />
        <p>
          Peapod needs access to your Spotify account to play music and sync with your pod members.
        </p>
        <button type="button" className="win95-btn" onClick={handleConnect}>
          Connect with Spotify
        </button>
      </div>
    </div>
  );
};
