import spotifyApi from '@/api/spotify-api';
import type { Pod, SpotifyProfile, SpotifyTrack, NowPlaying } from '@/types/peapod';

// --- Pod API ---

export const createPod = (createdBy: SpotifyProfile) =>
  spotifyApi.post<Pod>('/peapod', { createdBy }).then(r => r.data);

export const getPods = (userId?: string) =>
  spotifyApi.get<{ items: Pod[] }>('/peapod', { params: userId ? { userId } : undefined }).then(r => r.data);

export const getPod = (podId: string) => spotifyApi.get<Pod>(`/peapod/${podId}`).then(r => r.data);

export const updatePodName = (podId: string, name: string) =>
  spotifyApi.patch<{ message: string }>(`/peapod/${podId}/name`, { name }).then(r => r.data);

export const addMemberToPod = (podId: string, user: SpotifyProfile) =>
  spotifyApi.patch<{ message: string }>(`/peapod/${podId}/members`, { user }).then(r => r.data);

export const getInviteLink = (podId: string) =>
  spotifyApi.get<{ inviteLink: string }>(`/peapod/${podId}/invite`).then(r => r.data);

export const sendInvitation = (podId: string, messageType: string, to: string) =>
  spotifyApi.post<{ message: string }>(`/peapod/${podId}/invite`, { messageType, to }).then(r => r.data);

export const addToPlayQueue = (podId: string, track: SpotifyTrack) =>
  spotifyApi.patch<{ message: string }>(`/peapod/${podId}/queue`, { track }).then(r => r.data);

export const addToPlayHistory = (podId: string, track: SpotifyTrack) =>
  spotifyApi.patch<{ message: string }>(`/peapod/${podId}/history`, { track }).then(r => r.data);

export const addActiveMemberToPod = (podId: string, user: SpotifyProfile) =>
  spotifyApi.patch<{ message: string }>(`/peapod/${podId}/activeMembers`, { user }).then(r => r.data);

export const removeActiveMemberFromPod = (podId: string, userId: string) =>
  spotifyApi.post<{ message: string }>(`/peapod/${podId}/activeMembers/${userId}`).then(r => r.data);

// --- Sync API ---

export const pushNowPlayingToClients = (podId: string, nowPlaying: NowPlaying) =>
  spotifyApi.post<{ message: string }>(`/sync`, { nowPlaying }, { params: { podId } }).then(r => r.data);
