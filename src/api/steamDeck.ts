import { brainerdApiBaseUrl } from '@/utils/brainerdApiUrl';
import type { Deck60List } from 'types/steam';

/** Games that hold 60fps on the Steam Deck LCD, from brainerd-api. Empty on any failure so /steam still renders. */
export const getDeck60AppIds = async (): Promise<number[]> => {
  try {
    const response = await fetch(`${brainerdApiBaseUrl()}/steam/deck-60fps`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const { games }: Deck60List = await response.json();
    return games.map(game => game.appId);
  } catch {
    return [];
  }
};
