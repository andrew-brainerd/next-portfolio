'use server';

import { deleteRequest, getRequest, patchRequest, postRequest } from '@/api/client';
import type { GameStatePatch, GameType, RollWithMeGame } from '@/types/rollWithMe';

interface ListResponse {
  items: RollWithMeGame[];
}

interface InviteLinkResponse {
  inviteLink: string;
}

interface InviteSendResponse {
  message: string;
}

interface DeleteResponse {
  message: string;
}

export async function listGames(): Promise<RollWithMeGame[]> {
  const response = await getRequest<ListResponse>('/roll-with-me/games');
  return response?.items ?? [];
}

export async function createGame(type: GameType, name: string): Promise<RollWithMeGame> {
  return postRequest<{ type: GameType; name: string }, RollWithMeGame>('/roll-with-me/games', { type, name });
}

export async function getGame(gameId: string): Promise<RollWithMeGame | undefined> {
  return getRequest<RollWithMeGame>(`/roll-with-me/games/${gameId}`);
}

export async function updateGame(gameId: string, patch: GameStatePatch): Promise<RollWithMeGame | undefined> {
  return patchRequest<GameStatePatch, RollWithMeGame>(`/roll-with-me/games/${gameId}`, patch);
}

export async function joinGame(gameId: string, name: string): Promise<RollWithMeGame | undefined> {
  return patchRequest<{ name: string }, RollWithMeGame>(`/roll-with-me/games/${gameId}/players`, { name });
}

export async function deleteGame(gameId: string): Promise<void> {
  await deleteRequest(`/roll-with-me/games/${gameId}`);
}

export async function getInviteLink(gameId: string): Promise<InviteLinkResponse | undefined> {
  return getRequest<InviteLinkResponse>(`/roll-with-me/games/${gameId}/invite`);
}

export async function sendInvitation(
  gameId: string,
  messageType: 'sms' | 'email',
  to: string
): Promise<InviteSendResponse> {
  return postRequest<{ messageType: 'sms' | 'email'; to: string }, InviteSendResponse>(
    `/roll-with-me/games/${gameId}/invite`,
    { messageType, to }
  );
}

export type { DeleteResponse };
