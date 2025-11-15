import { getRequest, patchRequest, postRequest } from '@/api/client';

export interface PropertyRanking {
  address: string;
  rank: number;
  updatedAt: number;
}

/**
 * Get property rank by address
 */
export const getPropertyRank = async (address: string): Promise<number | null> => {
  try {
    const response = await getRequest<{ rank: number | null }>(`/zillow/rankings/${encodeURIComponent(address)}`);
    return response?.rank ?? null;
  } catch (error) {
    console.error('Error getting property rank:', error);
    return null;
  }
};

/**
 * Get rankings for multiple properties
 */
export const getPropertyRanksBatch = async (addresses: string[]): Promise<Record<string, number>> => {
  try {
    const response = await postRequest<{ addresses: string[] }, Record<string, number>>('/zillow/rankings/batch', {
      addresses
    });
    return response || {};
  } catch (error) {
    console.error('Error getting property rankings:', error);
    return {};
  }
};

/**
 * Set property rank
 */
export const setPropertyRank = async (address: string, rank: number): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!address || rank < 1 || !Number.isInteger(rank)) {
      return { success: false, error: 'Invalid input' };
    }

    await patchRequest<{ rank: number }, { success: boolean }>(`/zillow/rankings/${encodeURIComponent(address)}`, {
      rank
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting property rank:', error);
    return { success: false, error: 'Failed to save rank' };
  }
};
