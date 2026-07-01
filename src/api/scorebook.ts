'use server';

import { deleteRequest, getRequest, patchRequest, postRequest, putRequest } from '@/api/client';
import type {
  CreateFrisbeeGolfRoundInput,
  FrisbeeGolfFamilyMember,
  FrisbeeGolfHole,
  FrisbeeGolfPlayer,
  FrisbeeGolfRound,
  FrisbeeGolfUserStats
} from '@/types/scorebook';

interface ListRoundsResponse {
  rounds: FrisbeeGolfRound[];
}

interface FamilyResponse {
  family: FrisbeeGolfFamilyMember[];
}

export const getFrisbeeGolfFamily = async (): Promise<FrisbeeGolfFamilyMember[]> => {
  const response = await getRequest<FamilyResponse>('/scorebook/frisbee-golf/family');
  return response?.family ?? [];
};

export const listFrisbeeGolfRounds = async (): Promise<FrisbeeGolfRound[]> => {
  const response = await getRequest<ListRoundsResponse>('/scorebook/frisbee-golf/rounds');
  return response?.rounds ?? [];
};

export const getFrisbeeGolfRound = async (roundId: string): Promise<FrisbeeGolfRound | undefined> => {
  return getRequest<FrisbeeGolfRound>(`/scorebook/frisbee-golf/rounds/${roundId}`);
};

export const createFrisbeeGolfRound = async (input: CreateFrisbeeGolfRoundInput): Promise<FrisbeeGolfRound> => {
  return postRequest<CreateFrisbeeGolfRoundInput, FrisbeeGolfRound>('/scorebook/frisbee-golf/rounds', input);
};

export const deleteFrisbeeGolfRound = async (roundId: string): Promise<void> => {
  await deleteRequest(`/scorebook/frisbee-golf/rounds/${roundId}`);
};

export const updateFrisbeeGolfRoundName = async (
  roundId: string,
  name: string
): Promise<FrisbeeGolfRound | undefined> => {
  return patchRequest<{ name: string }, FrisbeeGolfRound>(`/scorebook/frisbee-golf/rounds/${roundId}`, { name });
};

export const updateFrisbeeGolfHoles = async (
  roundId: string,
  holes: FrisbeeGolfHole[]
): Promise<FrisbeeGolfRound | undefined> => {
  return patchRequest<{ holes: FrisbeeGolfHole[] }, FrisbeeGolfRound>(`/scorebook/frisbee-golf/rounds/${roundId}`, {
    holes
  });
};

export const addFrisbeeGolfPlayer = async (
  roundId: string,
  player: Omit<FrisbeeGolfPlayer, 'id'>
): Promise<FrisbeeGolfRound> => {
  return postRequest<Omit<FrisbeeGolfPlayer, 'id'>, FrisbeeGolfRound>(
    `/scorebook/frisbee-golf/rounds/${roundId}/players`,
    player
  );
};

export const removeFrisbeeGolfPlayer = async (roundId: string, playerId: string): Promise<void> => {
  await deleteRequest(`/scorebook/frisbee-golf/rounds/${roundId}/players/${playerId}`);
};

export const startFrisbeeGolfRound = async (roundId: string): Promise<FrisbeeGolfRound> => {
  return postRequest<Record<string, never>, FrisbeeGolfRound>(`/scorebook/frisbee-golf/rounds/${roundId}/start`, {});
};

export const joinFrisbeeGolfRound = async (
  roundId: string,
  displayName?: string,
  color?: string
): Promise<FrisbeeGolfRound> => {
  return postRequest<{ displayName?: string; color?: string }, FrisbeeGolfRound>(
    `/scorebook/frisbee-golf/rounds/${roundId}/join`,
    { displayName, color }
  );
};

export const joinFrisbeeGolfRoundByCode = async (
  code: string,
  displayName?: string,
  color?: string
): Promise<FrisbeeGolfRound> => {
  return postRequest<{ code: string; displayName?: string; color?: string }, FrisbeeGolfRound>(
    '/scorebook/frisbee-golf/rounds/join-by-code',
    { code, displayName, color }
  );
};

export const setFrisbeeGolfCurrentHole = async (roundId: string, holeNumber: number): Promise<FrisbeeGolfRound> => {
  return putRequest<{ holeNumber: number }, FrisbeeGolfRound>(
    `/scorebook/frisbee-golf/rounds/${roundId}/current-hole`,
    { holeNumber }
  );
};

export const setFrisbeeGolfGamemaster = async (roundId: string, userId: string): Promise<FrisbeeGolfRound> => {
  return putRequest<{ userId: string }, FrisbeeGolfRound>(`/scorebook/frisbee-golf/rounds/${roundId}/gamemaster`, {
    userId
  });
};

export const setFrisbeeGolfScore = async (
  roundId: string,
  playerId: string,
  holeNumber: number,
  score: number
): Promise<FrisbeeGolfRound> => {
  return putRequest<{ score: number }, FrisbeeGolfRound>(
    `/scorebook/frisbee-golf/rounds/${roundId}/scores/${playerId}/${holeNumber}`,
    { score }
  );
};

export const clearFrisbeeGolfScore = async (roundId: string, playerId: string, holeNumber: number): Promise<void> => {
  await deleteRequest(`/scorebook/frisbee-golf/rounds/${roundId}/scores/${playerId}/${holeNumber}`);
};

export const completeFrisbeeGolfRound = async (roundId: string): Promise<FrisbeeGolfRound> => {
  return postRequest<Record<string, never>, FrisbeeGolfRound>(`/scorebook/frisbee-golf/rounds/${roundId}/complete`, {});
};

export const getFrisbeeGolfStats = async (): Promise<FrisbeeGolfUserStats | undefined> => {
  return getRequest<FrisbeeGolfUserStats>('/scorebook/frisbee-golf/stats');
};
