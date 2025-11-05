import type { CreateExperienceGroupRequest, ExperienceGroup } from '@/types/keiken';
import { getRequest, postRequest } from '@/api/client';

/**
 * Get all experience groups for a specific user
 * @param userId - The user ID to fetch experience groups for
 * @returns Promise with array of experience groups or undefined
 */
export const getExperienceGroups = (userId: string): Promise<ExperienceGroup[] | undefined> => {
  return getRequest<ExperienceGroup[]>('/keiken', { userId });
};

/**
 * Create a new experience group
 * @param data - The experience group data
 * @returns Promise with the created experience group
 */
export const createExperienceGroup = (data: CreateExperienceGroupRequest): Promise<ExperienceGroup> => {
  return postRequest<CreateExperienceGroupRequest, ExperienceGroup>('/keiken', data);
};
