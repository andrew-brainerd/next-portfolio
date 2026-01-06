export interface ExperienceGroup {
  experienceGroupId: string;
  name: string;
  description: string;
  categories: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperienceGroupRequest {
  name: string;
  description: string;
  categories?: string[];
  createdBy: string;
}

export interface UpdateExperienceGroupRequest {
  name?: string;
  description?: string;
  categories?: string[];
}

export interface Experience {
  experienceId: string;
  experienceGroupId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  notes: string;
  category: string;
  rating: number | null;
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
  category?: string;
  rating?: number;
  createdBy: string;
}
