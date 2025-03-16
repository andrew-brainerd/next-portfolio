import type { FollowedManga } from 'types/manga';
import { getRequest, postRequest } from 'api/client';

export const followManga = (manga: FollowedManga) => {
  return postRequest<FollowedManga, { message: string }>('/manga/following', manga);
};

export const getFollowedManaga = () => {
  return getRequest<FollowedManga[]>('/manga/following');
};

export const getMangaCover = (slug: string) => {
  return getRequest<{ imageUrl: string }>(`/manga/cover?slug=${slug}`);
};
