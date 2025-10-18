import type { FollowedManga } from 'types/manga';
import { getRequest, postRequest } from 'api/client';

export const followManga = (manga: FollowedManga): Promise<{ message: string }> => {
  return postRequest<FollowedManga, { message: string }>('/manga/following', manga);
};

export const getFollowedManaga = (): Promise<FollowedManga[] | undefined> => {
  return getRequest<FollowedManga[]>('/manga/following');
};

export const getMangaCover = (slug: string): Promise<{ imageUrl: string } | undefined> => {
  return getRequest<{ imageUrl: string }>(`/manga/cover?slug=${slug}`);
};
