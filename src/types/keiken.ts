export interface ExperienceGroup {
  experienceGroupId: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperienceGroupRequest {
  name: string;
  description: string;
  createdBy: string;
}
