import type { ZillowProperty } from '@/types/zillow';
import { getRequest } from '@/api/client';

/**
 * Get all Zillow property listings
 * @returns Promise with array of Zillow properties or undefined
 */
export const getZillowProperties = (): Promise<ZillowProperty[] | undefined> => {
  return getRequest<ZillowProperty[]>('/api/zillow');
};
