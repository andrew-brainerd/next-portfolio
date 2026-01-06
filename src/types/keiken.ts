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

export interface Experience {
  experienceId: string;
  experienceGroupId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperienceRequest {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  notes?: string;
  createdBy: string;
}
