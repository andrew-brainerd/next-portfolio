'use server';

import { deleteRequest, getRequest, postRequest } from '@/api/client';
import type { CreateFrisbeeGolfRoundInput, FrisbeeGolfRound } from '@/types/scorebook';

interface ListRoundsResponse {
  rounds: FrisbeeGolfRound[];
}

export const listFrisbeeGolfRounds = async (): Promise<FrisbeeGolfRound[]> => {
  const response = await getRequest<ListRoundsResponse>('/scorebook/frisbee-golf/rounds');
  return response?.rounds ?? [];
};

export const getFrisbeeGolfRound = (roundId: string): Promise<FrisbeeGolfRound | undefined> => {
  return getRequest<FrisbeeGolfRound>(`/scorebook/frisbee-golf/rounds/${roundId}`);
};

export const createFrisbeeGolfRound = (input: CreateFrisbeeGolfRoundInput): Promise<FrisbeeGolfRound> => {
  return postRequest<CreateFrisbeeGolfRoundInput, FrisbeeGolfRound>('/scorebook/frisbee-golf/rounds', input);
};

export const deleteFrisbeeGolfRound = async (roundId: string): Promise<void> => {
  await deleteRequest(`/scorebook/frisbee-golf/rounds/${roundId}`);
};
