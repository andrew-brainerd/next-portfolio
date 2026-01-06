import type {
  CreateExperienceGroupRequest,
  CreateExperienceRequest,
  Experience,
  ExperienceGroup,
  UpdateExperienceGroupRequest
} from '@/types/keiken';
import { getRequest, patchRequest, postRequest } from '@/api/client';

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

/**
 * Get a specific experience group by ID
 * @param experienceGroupId - The experience group ID to fetch
 * @returns Promise with the experience group or undefined
 */
export const getExperienceGroup = (experienceGroupId: string): Promise<ExperienceGroup | undefined> => {
  return getRequest<ExperienceGroup>(`/keiken/${experienceGroupId}`);
};

/**
 * Update an experience group
 * @param experienceGroupId - The experience group ID to update
 * @param data - The data to update
 * @returns Promise with the updated experience group
 */
export const updateExperienceGroup = (
  experienceGroupId: string,
  data: UpdateExperienceGroupRequest
): Promise<ExperienceGroup | void> => {
  return patchRequest<UpdateExperienceGroupRequest, ExperienceGroup>(`/keiken/${experienceGroupId}`, data);
};

/**
 * Get all experiences for a specific experience group
 * @param experienceGroupId - The experience group ID to fetch experiences for
 * @returns Promise with array of experiences or undefined
 */
export const getExperiences = (experienceGroupId: string): Promise<Experience[] | undefined> => {
  return getRequest<Experience[]>(`/keiken/${experienceGroupId}/experiences`);
};

/**
 * Create a new experience in an experience group
 * @param experienceGroupId - The experience group ID
 * @param data - The experience data
 * @returns Promise with the created experience
 */
export const createExperience = (experienceGroupId: string, data: CreateExperienceRequest): Promise<Experience> => {
  return postRequest<CreateExperienceRequest, Experience>(`/keiken/${experienceGroupId}/experiences`, data);
};
