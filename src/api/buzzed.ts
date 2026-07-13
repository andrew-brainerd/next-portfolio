'use server';

import { deleteRequest, getRequest, patchRequest, postRequest, putRequest } from '@/api/client';
import type { BuzzedGame, BuzzResponse, CreateBuzzedGameInput } from '@/types/buzzed';

interface ListGamesResponse {
  games: BuzzedGame[];
}

interface ServerTimeResponse {
  now: number;
}

export const listBuzzedGames = async (): Promise<BuzzedGame[]> => {
  const response = await getRequest<ListGamesResponse>('/buzzed/games');
  return response?.games ?? [];
};

export const getBuzzedGame = async (gameId: string): Promise<BuzzedGame | undefined> =>
  getRequest<BuzzedGame>(`/buzzed/games/${gameId}`);

export const lookupBuzzedGameByCode = async (code: string): Promise<BuzzedGame | undefined> =>
  getRequest<BuzzedGame>(`/buzzed/games/join-code/${encodeURIComponent(code)}`);

export const createBuzzedGame = async (input: CreateBuzzedGameInput): Promise<BuzzedGame> =>
  postRequest<CreateBuzzedGameInput, BuzzedGame>('/buzzed/games', input);

export const joinBuzzedGameByCode = async (code: string, color?: string): Promise<BuzzedGame> =>
  postRequest<{ code: string; color?: string }, BuzzedGame>('/buzzed/games/join-by-code', { code, color });

export const joinBuzzedGame = async (gameId: string, color?: string): Promise<BuzzedGame> =>
  postRequest<{ color?: string }, BuzzedGame>(`/buzzed/games/${gameId}/join`, { color });

export const updateBuzzedGame = async (
  gameId: string,
  updates: CreateBuzzedGameInput
): Promise<BuzzedGame> => patchRequest<CreateBuzzedGameInput, BuzzedGame>(`/buzzed/games/${gameId}`, updates);

export const startBuzzedGame = async (gameId: string): Promise<BuzzedGame> =>
  postRequest<object, BuzzedGame>(`/buzzed/games/${gameId}/start`, {});

export const completeBuzzedGame = async (gameId: string): Promise<BuzzedGame> =>
  postRequest<object, BuzzedGame>(`/buzzed/games/${gameId}/complete`, {});

export const deleteBuzzedGame = async (gameId: string): Promise<void> =>
  deleteRequest(`/buzzed/games/${gameId}`);

export const buzzBuzzedGame = async (
  gameId: string,
  questionIndex: number,
  positionSec?: number
): Promise<BuzzResponse> =>
  postRequest<{ questionIndex: number; positionSec?: number }, BuzzResponse>(
    `/buzzed/games/${gameId}/buzz`,
    { questionIndex, positionSec }
  );

export const resolveBuzzedQuestion = async (
  gameId: string,
  correct: boolean,
  answerText?: string
): Promise<BuzzedGame> =>
  postRequest<{ correct: boolean; answerText?: string }, BuzzedGame>(`/buzzed/games/${gameId}/resolve`, {
    correct,
    answerText
  });

export const overturnBuzzedQuestion = async (gameId: string): Promise<BuzzedGame> =>
  postRequest<object, BuzzedGame>(`/buzzed/games/${gameId}/overturn`, {});

export const leaveBuzzedRoster = async (gameId: string): Promise<void> =>
  deleteRequest(`/buzzed/games/${gameId}/players/me`);

export const setBuzzedVideo = async (
  gameId: string,
  videoId: string,
  videoTitle?: string
): Promise<BuzzedGame> =>
  putRequest<{ videoId: string; videoTitle?: string }, BuzzedGame>(`/buzzed/games/${gameId}/video`, {
    videoId,
    videoTitle
  });

export const setBuzzedPlayback = async (
  gameId: string,
  playing: boolean,
  positionSec: number
): Promise<BuzzedGame> =>
  putRequest<{ playing: boolean; positionSec: number }, BuzzedGame>(`/buzzed/games/${gameId}/playback`, {
    playing,
    positionSec
  });

export const getBuzzedServerTime = async (): Promise<number | undefined> => {
  const response = await getRequest<ServerTimeResponse>('/buzzed/time');
  return response?.now;
};
