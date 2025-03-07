export interface AuthResponse {
  isError: boolean;
  message: string;
}

export type DataRecord = Record<string, string | undefined>;

export interface DocumentFolder {
  name: string;
}

export interface UploadedDocument extends DataRecord {
  createdDate: string;
  displayName?: string;
  downloadUrl?: string;
  modifiedDate: string;
  name: string;
  originalName?: string;
  path: string;
}

export interface UserUpdates {
  displayName?: string;
  photoURL?: string;
}
