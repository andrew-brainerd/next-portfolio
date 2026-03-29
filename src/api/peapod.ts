'use server';

import type { Pod, SpotifyProfile, SpotifyTrack, NowPlaying } from '@/types/peapod';
import { getRequest, postRequest, patchRequest, deleteRequest } from '@/api/client';
import axios from 'axios';
import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from 'constants/authentication';

const getSpotifyHeaders = async () => {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BRAINERD_API_URL,
  withCredentials: true
});

// --- Pod API ---

export const createPod = (createdBy: SpotifyProfile) =>
  postRequest<{ createdBy: SpotifyProfile }, Pod>('/peapod', { createdBy });

export const getPods = (userId?: string) => getRequest<{ items: Pod[] }>('/peapod', userId ? { userId } : undefined);

export const getPod = (podId: string) => getRequest<Pod>(`/peapod/${podId}`);

export const deletePod = (podId: string) => deleteRequest(`/peapod/${podId}`);

export const addMemberToPod = (podId: string, user: SpotifyProfile) =>
  patchRequest<{ user: SpotifyProfile }, { message: string }>(`/peapod/${podId}/members`, { user });

export const removeMemberFromPod = (podId: string, user: SpotifyProfile) => {
  // Uses deleteRequest but needs body - use axios directly
  return apiClient
    .delete(`/peapod/${podId}/members`, {
      data: { user },
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.data);
};

export const getInviteLink = (podId: string) => getRequest<{ inviteLink: string }>(`/peapod/${podId}/invite`);

export const sendInvitation = (podId: string, messageType: string, to: string) =>
  postRequest<{ messageType: string; to: string }, { message: string }>(`/peapod/${podId}/invite`, {
    messageType,
    to
  });

export const addToPlayQueue = (podId: string, track: SpotifyTrack) =>
  patchRequest<{ track: SpotifyTrack }, { message: string }>(`/peapod/${podId}/queue`, { track });

export const removeFromPlayQueue = (podId: string, track: SpotifyTrack) => {
  return apiClient
    .delete(`/peapod/${podId}/queue`, {
      data: { track },
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.data);
};

export const addToPlayHistory = (podId: string, track: SpotifyTrack) =>
  patchRequest<{ track: SpotifyTrack }, { message: string }>(`/peapod/${podId}/history`, { track });

export const addActiveMemberToPod = (podId: string, user: SpotifyProfile) =>
  patchRequest<{ user: SpotifyProfile }, { message: string }>(`/peapod/${podId}/activeMembers`, { user });

export const removeActiveMemberFromPod = async (podId: string, userId: string) => {
  const headers = await getSpotifyHeaders();
  return apiClient.post(`/peapod/${podId}/activeMembers/${userId}`, {}, { headers }).then(res => res.data);
};

// --- Sync API ---

export const pushNowPlayingToClients = async (podId: string, nowPlaying: NowPlaying) =>
  postRequest<{ nowPlaying: NowPlaying }, { message: string }>(`/sync?podId=${podId}`, { nowPlaying });

// --- Spotify API ---

export const getSpotifyAuthUrl = () => getRequest<{ authUrl: string }>('/spotify/auth');

export const refreshSpotifyAuth = (accessToken: string | null, refreshToken: string | null) =>
  postRequest<
    { accessToken: string | null; refreshToken: string | null },
    { response: { access_token: string; expires_in: number } }
  >('/spotify/auth', { accessToken, refreshToken });

export const getSpotifyConnection = () => getRequest<{ connected: boolean }>('/spotify/connection');

export const saveSpotifyTokens = (accessToken: string, refreshToken: string, expireTime: string) =>
  postRequest<{ accessToken: string; refreshToken: string; expireTime: string }, { message: string }>(
    '/spotify/tokens',
    { accessToken, refreshToken, expireTime }
  );

export const getSpotifyProfile = async (spotifyToken: string) => {
  const headers = await getSpotifyHeaders();
  return apiClient
    .get('/spotify/profile', { headers: { ...headers, 'x-spotify-token': spotifyToken } })
    .then(res => res.data);
};

export const getMyTopTracks = async (spotifyToken: string) => {
  const headers = await getSpotifyHeaders();
  return apiClient
    .get('/spotify/myTopTracks', { headers: { ...headers, 'x-spotify-token': spotifyToken } })
    .then(res => res.data);
};

export const getMyDevices = async (spotifyToken: string) => {
  const headers = await getSpotifyHeaders();
  return apiClient
    .get('/spotify/myDevices', { headers: { ...headers, 'x-spotify-token': spotifyToken } })
    .then(res => res.data);
};

export const getMyNowPlaying = async (spotifyToken: string) => {
  const headers = await getSpotifyHeaders();
  return apiClient
    .get('/spotify/myNowPlaying', { headers: { ...headers, 'x-spotify-token': spotifyToken } })
    .then(res => res.data);
};

export const transferPlayback = async (spotifyToken: string, devices: string[], shouldPlay = false) => {
  const headers = await getSpotifyHeaders();
  return apiClient
    .put(
      '/spotify/transferPlayback',
      { devices, shouldPlay },
      { headers: { ...headers, 'x-spotify-token': spotifyToken } }
    )
    .then(res => res.data);
};

export const play = async (spotifyToken: string, options?: { uris?: string[] }) => {
  const headers = await getSpotifyHeaders();
  return apiClient
    .put('/spotify/play', options || {}, { headers: { ...headers, 'x-spotify-token': spotifyToken } })
    .then(res => res.data);
};

export const pause = async (spotifyToken: string) => {
  const headers = await getSpotifyHeaders();
  return apiClient
    .put('/spotify/pause', {}, { headers: { ...headers, 'x-spotify-token': spotifyToken } })
    .then(res => res.data);
};

export const searchSpotify = async (spotifyToken: string, searchText: string) => {
  const headers = await getSpotifyHeaders();
  return apiClient
    .post(
      '/spotify/search',
      { searchText, types: ['track'] },
      { headers: { ...headers, 'x-spotify-token': spotifyToken } }
    )
    .then(res => res.data);
};
