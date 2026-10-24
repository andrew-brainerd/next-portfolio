'use server';

import axios, { type AxiosError } from 'axios';

import { getRequest, postRequest, putRequest } from 'api/client';
import { brainerdApiBaseUrl } from '@/utils/brainerdApiUrl';
import type { CondensatePoll, CondensatePollPreview, PollLoad, SteamStoreHit } from 'types/condensatePoll';

const POLL_ID = /^[0-9a-f]{32}$/;
const path = (pollId: string) => `/condensate/polls/${pollId}`;

const statusOf = (e: unknown) => (e as AxiosError).response?.status ?? 0;

// Public and names nobody: used for the Open Graph tags (AC-26.8).
export const getPollPreview = async (pollId: string): Promise<CondensatePollPreview | null> => {
  if (!POLL_ID.test(pollId)) return null;
  return axios
    .get<CondensatePollPreview>(`${brainerdApiBaseUrl()}${path(pollId)}/preview`, { timeout: 10000 })
    .then(r => r.data)
    .catch(() => null);
};

// Needs a Steam sign-in or an account linked to Steam; any other sign-in gets 401 from brainerd-api.
export const getPoll = async (pollId: string): Promise<PollLoad> => {
  if (!POLL_ID.test(pollId)) return { ok: false, status: 404 };
  const poll = await getRequest<CondensatePoll>(path(pollId));
  if (poll) return { ok: true, poll };
  return { ok: false, status: 401 };
};

// null means the list couldn't be loaded.
export const getCondensatePolls = async (): Promise<CondensatePoll[] | null> =>
  (await getRequest<CondensatePoll[]>('/condensate/polls')) ?? null;

export const setPollBallot = async (pollId: string, appIds: number[]): Promise<PollLoad> => {
  try {
    return {
      ok: true,
      poll: await putRequest<{ appIds: number[] }, CondensatePoll>(`${path(pollId)}/ballot`, { appIds })
    };
  } catch (e) {
    return { ok: false, status: statusOf(e) };
  }
};

export const suggestPollGame = async (pollId: string, appId: number, name: string): Promise<PollLoad> => {
  try {
    return {
      ok: true,
      poll: await postRequest<{ option: { appId: number; name: string } }, CondensatePoll>(`${path(pollId)}/options`, {
        option: { appId, name }
      })
    };
  } catch (e) {
    return { ok: false, status: statusOf(e) };
  }
};

// Steam's public store search, from the server so the browser doesn't hit Steam's CORS rules.
export const searchSteamStore = async (term: string): Promise<SteamStoreHit[]> => {
  const q = term.trim();
  if (q.length < 2) return [];
  const data = await axios
    .get<{ items?: { type: string; id: number; name: string }[] }>('https://store.steampowered.com/api/storesearch/', {
      params: { term: q, l: 'english', cc: 'US' },
      timeout: 10000
    })
    .then(r => r.data)
    .catch(() => ({ items: [] }));
  return (data.items ?? [])
    .filter(i => i.type === 'app')
    .slice(0, 10)
    .map(i => ({ appId: i.id, name: i.name }));
};
