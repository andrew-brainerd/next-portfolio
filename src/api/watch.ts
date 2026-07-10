import type {
  ApiUsage,
  ShowType,
  StreamingServiceRef,
  WatchItem,
  WatchListResponse,
  WatchMedia,
  WatchSearchResult,
  WatchSettings,
  WatchStatus
} from 'types/watch';
import { deleteRequest, getRequest, patchRequest, postRequest, putRequest } from 'api/client';

export const searchWatch = (q: string): Promise<WatchSearchResult[] | undefined> =>
  getRequest<WatchSearchResult[]>('/watch/search', { q });

export const getWatchList = (): Promise<WatchListResponse | undefined> =>
  getRequest<WatchListResponse>('/watch/list');

export const getWatchUsage = (): Promise<ApiUsage[] | undefined> => getRequest<ApiUsage[]>('/watch/usage');

export const addToWatch = (input: { id: string; showType: ShowType; status?: WatchStatus }): Promise<WatchItem> =>
  postRequest<typeof input, WatchItem>('/watch/list', input);

export const updateWatchItem = (
  id: string,
  patch: { status?: WatchStatus; progress?: { season: number; episode: number }; favorite?: boolean }
): Promise<WatchItem | void> => patchRequest<typeof patch, WatchItem>(`/watch/list/${id}`, patch);

export const removeFromWatch = (id: string): Promise<void> => deleteRequest(`/watch/list/${id}`);

export const getWatchMedia = (id: string, type: ShowType): Promise<WatchMedia | undefined> =>
  getRequest<WatchMedia>(`/watch/media/${id}`, { type });

export const getWatchServices = (): Promise<StreamingServiceRef[] | undefined> =>
  getRequest<StreamingServiceRef[]>('/watch/services');

export const getWatchSettings = (): Promise<WatchSettings | undefined> =>
  getRequest<WatchSettings>('/watch/settings');

export const updateWatchSettings = (settings: Partial<WatchSettings>): Promise<WatchSettings> =>
  putRequest<Partial<WatchSettings>, WatchSettings>('/watch/settings', settings);
