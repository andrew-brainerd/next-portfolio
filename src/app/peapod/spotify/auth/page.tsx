'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSpotifyAuth, calculateExpireTime } from '@/hooks/usePeapod';
import { saveSpotifyTokens } from '@/api/peapod';

export default function SpotifyAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useSpotifyAuth(s => s.setAuth);

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');

    if (accessToken && refreshToken && expiresIn) {
      const expireTime = calculateExpireTime(expiresIn);

      setAuth({ accessToken, refreshToken, expireTime });

      // Save tokens server-side
      saveSpotifyTokens(accessToken, refreshToken, expireTime);

      // Redirect to saved return URI or peapod home
      const returnUri = localStorage.getItem('spotifyReturnUri') || '/peapod';
      localStorage.removeItem('spotifyReturnUri');
      router.push(returnUri);
    } else {
      router.push('/peapod');
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-white text-xl">Connecting to Spotify...</p>
    </div>
  );
}
