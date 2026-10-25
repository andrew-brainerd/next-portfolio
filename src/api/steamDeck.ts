import { brainerdApiBaseUrl } from '@/utils/brainerdApiUrl';
import type { Deck60List } from 'types/steam';

/** Games that hold 60fps on the Steam Deck LCD, from brainerd-api. Empty on any failure so /steam/deck still renders. */
export const getDeck60List = async (): Promise<Deck60List> => {
  try {
    const response = await fetch(`${brainerdApiBaseUrl()}/steam/deck-60fps`, { next: { revalidate: 3600 } });
    if (!response.ok) return { criteria: '', games: [] };
    return await response.json();
  } catch {
    return { criteria: '', games: [] };
  }
};
