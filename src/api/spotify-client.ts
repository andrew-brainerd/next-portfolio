import type { NowPlaying } from '@/types/peapod';

const API_URL = process.env.NEXT_PUBLIC_BRAINERD_API_URL;

const spotifyFetch = async (path: string, spotifyToken: string, options?: RequestInit) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-spotify-token': spotifyToken,
      ...options?.headers
    }
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const getSpotifyAuthUrl = async () => {
  const res = await fetch(`${API_URL}/spotify/auth`, { credentials: 'include' });
  return res.json() as Promise<{ authUrl: string }>;
};

export const getSpotifyProfile = (spotifyToken: string) => spotifyFetch('/spotify/profile', spotifyToken);

export const getMyTopTracks = (spotifyToken: string) => spotifyFetch('/spotify/myTopTracks', spotifyToken);

export const getMyDevices = (spotifyToken: string) => spotifyFetch('/spotify/myDevices', spotifyToken);

export const getMyNowPlaying = (spotifyToken: string) => spotifyFetch('/spotify/myNowPlaying', spotifyToken);

export const transferPlayback = (spotifyToken: string, devices: string[], shouldPlay = false) =>
  spotifyFetch('/spotify/transferPlayback', spotifyToken, {
    method: 'PUT',
    body: JSON.stringify({ devices, shouldPlay })
  });

export const play = (spotifyToken: string, options?: { uris?: string[] }) =>
  spotifyFetch('/spotify/play', spotifyToken, {
    method: 'PUT',
    body: JSON.stringify(options || {})
  });

export const pause = (spotifyToken: string) => spotifyFetch('/spotify/pause', spotifyToken, { method: 'PUT' });

export const searchSpotify = (spotifyToken: string, searchText: string) =>
  spotifyFetch('/spotify/search', spotifyToken, {
    method: 'POST',
    body: JSON.stringify({ searchText, types: ['track'] })
  });
