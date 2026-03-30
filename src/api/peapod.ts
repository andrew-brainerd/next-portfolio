'use server';

import type { Pod, SpotifyProfile, SpotifyTrack, NowPlaying } from '@/types/peapod';
import { getRequest, postRequest, patchRequest } from '@/api/client';

// --- Pod API ---

export const createPod = async (createdBy: SpotifyProfile) =>
  postRequest<{ createdBy: SpotifyProfile }, Pod>('/peapod', { createdBy });

export const getPods = async (userId?: string) =>
  getRequest<{ items: Pod[] }>('/peapod', userId ? { userId } : undefined);

export const getPod = async (podId: string) => getRequest<Pod>(`/peapod/${podId}`);

export const addMemberToPod = async (podId: string, user: SpotifyProfile) =>
  patchRequest<{ user: SpotifyProfile }, { message: string }>(`/peapod/${podId}/members`, { user });

export const getInviteLink = async (podId: string) => getRequest<{ inviteLink: string }>(`/peapod/${podId}/invite`);

export const sendInvitation = async (podId: string, messageType: string, to: string) =>
  postRequest<{ messageType: string; to: string }, { message: string }>(`/peapod/${podId}/invite`, {
    messageType,
    to
  });

export const addToPlayQueue = async (podId: string, track: SpotifyTrack) =>
  patchRequest<{ track: SpotifyTrack }, { message: string }>(`/peapod/${podId}/queue`, { track });

export const addToPlayHistory = async (podId: string, track: SpotifyTrack) =>
  patchRequest<{ track: SpotifyTrack }, { message: string }>(`/peapod/${podId}/history`, { track });

export const addActiveMemberToPod = async (podId: string, user: SpotifyProfile) =>
  patchRequest<{ user: SpotifyProfile }, { message: string }>(`/peapod/${podId}/activeMembers`, { user });

export const removeActiveMemberFromPod = async (podId: string, userId: string) =>
  postRequest<Record<string, never>, { message: string }>(`/peapod/${podId}/activeMembers/${userId}`);

// --- Sync API ---

export const pushNowPlayingToClients = async (podId: string, nowPlaying: NowPlaying) =>
  postRequest<{ nowPlaying: NowPlaying }, { message: string }>(`/sync?podId=${podId}`, { nowPlaying });
