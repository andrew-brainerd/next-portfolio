'use server';

import { deleteRequest, getRequest, patchRequest, postRequest, putRequest } from '@/api/client';
import type {
  AcceptInviteResult,
  AddItemInput,
  DietaryPreferences,
  InvitePreview,
  Pantry,
  PantryDetail,
  PantryInvite,
  PantryItem,
  RecipeIdeasResult,
  ScanSummary,
  UpdateItemInput
} from '@/types/oishii';

interface ListPantriesResponse {
  pantries: Pantry[];
}

interface ListInvitesResponse {
  invites: PantryInvite[];
}

interface ListItemsResponse {
  items: PantryItem[];
}

export const listPantries = async (): Promise<Pantry[]> => {
  const response = await getRequest<ListPantriesResponse>('/oishii/pantries');
  return response?.pantries ?? [];
};

export const createPantry = async (name: string): Promise<Pantry> => {
  return postRequest<{ name: string }, Pantry>('/oishii/pantries', { name });
};

export const getPantry = async (id: string): Promise<PantryDetail | undefined> => {
  return getRequest<PantryDetail>(`/oishii/pantries/${id}`);
};

export const renamePantry = async (id: string, name: string): Promise<Pantry | undefined> => {
  return patchRequest<{ name: string }, Pantry>(`/oishii/pantries/${id}`, { name });
};

export const deletePantry = async (id: string): Promise<void> => {
  await deleteRequest(`/oishii/pantries/${id}`);
};

export const transferOwnership = async (id: string, userId: string): Promise<Pantry> => {
  return postRequest<{ userId: string }, Pantry>(`/oishii/pantries/${id}/transfer`, { userId });
};

export const removeMember = async (id: string, userId: string): Promise<void> => {
  await deleteRequest(`/oishii/pantries/${id}/members/${userId}`);
};

export const inviteByEmail = async (id: string, email: string): Promise<PantryInvite> => {
  return postRequest<{ email: string }, PantryInvite>(`/oishii/pantries/${id}/invites`, { email });
};

export const listInvites = async (id: string): Promise<PantryInvite[]> => {
  const response = await getRequest<ListInvitesResponse>(`/oishii/pantries/${id}/invites`);
  return response?.invites ?? [];
};

export const revokeInvite = async (id: string, inviteId: string): Promise<void> => {
  await deleteRequest(`/oishii/pantries/${id}/invites/${inviteId}`);
};

export const getInvite = async (token: string): Promise<InvitePreview | undefined> => {
  return getRequest<InvitePreview>(`/oishii/invites/${token}`);
};

export const acceptInvite = async (token: string): Promise<AcceptInviteResult> => {
  return postRequest<Record<string, never>, AcceptInviteResult>(`/oishii/invites/${token}/accept`, {});
};

export const listItems = async (id: string): Promise<PantryItem[]> => {
  const response = await getRequest<ListItemsResponse>(`/oishii/pantries/${id}/items`);
  return response?.items ?? [];
};

export const addItem = async (id: string, input: AddItemInput): Promise<PantryItem> => {
  return postRequest<AddItemInput, PantryItem>(`/oishii/pantries/${id}/items`, input);
};

export const updateItem = async (
  id: string,
  itemId: string,
  updates: UpdateItemInput
): Promise<PantryItem | undefined> => {
  return patchRequest<UpdateItemInput, PantryItem>(`/oishii/pantries/${id}/items/${itemId}`, updates);
};

export const removeItem = async (id: string, itemId: string): Promise<void> => {
  await deleteRequest(`/oishii/pantries/${id}/items/${itemId}`);
};

export const getGmailConnection = async (): Promise<boolean> => {
  const response = await getRequest<{ connected: boolean }>('/oishii/gmail/connection');
  return response?.connected ?? false;
};

export const disconnectGmail = async (): Promise<void> => {
  await deleteRequest('/oishii/gmail/connection');
};

export const scanPantry = async (id: string, fullRescan = false): Promise<ScanSummary> => {
  // Scanning fans out to Gmail; give it more headroom than the 15s default.
  return postRequest<{ fullRescan: boolean }, ScanSummary>(`/oishii/pantries/${id}/scan`, { fullRescan }, 60000);
};

export const getPreferences = async (): Promise<DietaryPreferences> => {
  const response = await getRequest<DietaryPreferences>('/oishii/preferences');
  return { intolerances: response?.intolerances ?? [], diets: response?.diets ?? [] };
};

export const setPreferences = async (prefs: DietaryPreferences): Promise<DietaryPreferences> => {
  return putRequest<DietaryPreferences, DietaryPreferences>('/oishii/preferences', prefs);
};

export const getRecipeIdeas = async (id: string, forUserIds?: string[]): Promise<RecipeIdeasResult> => {
  const params = forUserIds && forUserIds.length > 0 ? { forUserIds: forUserIds.join(',') } : undefined;
  const response = await getRequest<RecipeIdeasResult>(`/oishii/pantries/${id}/recipes`, params);
  return {
    recipes: response?.recipes ?? [],
    appliedIntolerances: response?.appliedIntolerances ?? [],
    appliedDiets: response?.appliedDiets ?? []
  };
};
