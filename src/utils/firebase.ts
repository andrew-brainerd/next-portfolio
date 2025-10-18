import { initializeApp } from 'firebase/app';
import {
  type AuthError,
  confirmPasswordReset,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  type User
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import {
  deleteObject,
  getStorage,
  ref as storageRef,
  listAll,
  getDownloadURL,
  type ListResult,
  updateMetadata,
  getMetadata,
  type StorageReference
} from 'firebase/storage';

import type { AuthResponse, DocumentFolder, UploadedDocument, UserUpdates } from 'types/firebase';
import { getDateTime } from 'utils/date';
import { bakeCookie } from 'api/authentication';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL
};

if (!firebaseConfig.apiKey) {
  console.error('Invalid Firebase Configuration Provided');
}

const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export const firebaseDb = getDatabase(firebaseApp);
export const firebaseStore = getFirestore(firebaseApp);

export const resetPassword = (code: string, newPassword: string): Promise<void> => {
  return confirmPasswordReset(firebaseAuth, code, newPassword);
};

export const sendForgotPasswordEmail = (email: string): Promise<void> => {
  return sendPasswordResetEmail(firebaseAuth, email);
};

export const signInUser = (email: string, password: string): Promise<AuthResponse> => {
  return signInWithEmailAndPassword(firebaseAuth, email, password)
    .then(async userCredential => {
      const idToken = await userCredential.user.getIdToken();

      await bakeCookie(idToken);

      return {
        isError: false,
        message: 'Login successful'
      };
    })
    .catch(error => {
      const err = error as AuthError;
      console.error('Login error', err.message);

      return {
        isError: true,
        message: 'Login failed. Please try again.'
      };
    });
};

export const signOutUser = (): Promise<Response> => {
  return fetch('/api/auth', { method: 'DELETE' });
};

export const updateUser = async (user: User, updates: UserUpdates): Promise<void> => {
  if (user) {
    try {
      await updateProfile(user, updates);
      console.debug('User updated');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error updating profile');
      console.error('Error updating profile', err.message);
      throw err;
    }
  }
};

export const updateUserPassword = async (password: string): Promise<void> => {
  if (firebaseAuth.currentUser) {
    try {
      await updatePassword(firebaseAuth.currentUser, password);
      localStorage.clear();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error updating password');
      console.error('Error updating password', err.message);
      throw err;
    }
  }
};

export const updateUserProfile = async (updates: UserUpdates): Promise<void> => {
  if (firebaseAuth.currentUser) {
    try {
      await updateProfile(firebaseAuth.currentUser, updates);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error updating profile');
      console.error('Error updating profile', err.message);
      throw err;
    }
  }
};

export const getUserDocumentFolders = async (userId: string): Promise<Array<DocumentFolder>> => {
  if (!userId) return [];

  const listRef = storageRef(firebaseStorage, `documents/${userId}`);
  const userDocumentFolders = await listAll(listRef);
  const userFolders = userDocumentFolders.prefixes.map(folderRef => ({ name: folderRef.name }));

  return userFolders;
};

export const getProjectDocumentFolders = async (
  organizationId?: string,
  projectId?: string
): Promise<DocumentFolder[]> => {
  if (!organizationId || !projectId) return [];

  const listRef = storageRef(firebaseStorage, `organizations/${organizationId}/projects/${projectId}`);
  const projectDocumentFolders = await listAll(listRef);
  const projectFolders = projectDocumentFolders.prefixes.map(folderRef => ({ name: folderRef.name }));

  return projectFolders;
};

export const getUserDocuments = async (userId: string, folder: string) => {
  const listRef = storageRef(firebaseStorage, `documents/${userId}/${folder}`);
  const documents = await listAll(listRef);

  return await getDocumentData(documents);
};

export const getProjectDocuments = async (organizationId: string, projectId: string, folder: string) => {
  const listRef = storageRef(firebaseStorage, `organizations/${organizationId}/projects/${projectId}/${folder}`);
  const documents = await listAll(listRef);

  return await getDocumentData(documents);
};

const getDocumentData = async (userDocuments: ListResult): Promise<UploadedDocument[]> => {
  return Promise.all(
    userDocuments.items.map(async ({ fullPath, name }: StorageReference) => {
      const [createdDate, displayName, downloadUrl, modifiedDate, originalName] = await Promise.all([
        getDocumentUploadDate(fullPath),
        getDocumentDisplayName(fullPath),
        getFirebaseDownloadUrl(fullPath),
        getDocumentUpdateDate(fullPath),
        getDocumentOriginalName(fullPath)
      ]);

      return {
        createdDate,
        displayName,
        downloadUrl,
        modifiedDate,
        name,
        originalName,
        path: fullPath
      };
    })
  );
};

export const renameUserDocument = async (documentPath: string, name: string) => {
  const documentRef = storageRef(firebaseStorage, documentPath);

  return updateMetadata(documentRef, { customMetadata: { displayName: name } });
};

export const deleteUserDocument = async (documentPath: string): Promise<void> => {
  const documentRef = storageRef(firebaseStorage, documentPath);

  return deleteObject(documentRef);
};

export const getDocumentDisplayName = (filePath: string): Promise<string | undefined> => {
  const fileRef = storageRef(firebaseStorage, filePath);

  return getMetadata(fileRef)
    .then(({ customMetadata }) => {
      return customMetadata?.displayName || '';
    })
    .catch((error: unknown) => {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get document display name', err);
      return undefined;
    });
};

export const getDocumentOriginalName = (filePath: string): Promise<string | undefined> => {
  const fileRef = storageRef(firebaseStorage, filePath);

  return getMetadata(fileRef)
    .then(({ customMetadata }) => {
      return customMetadata?.originalName || '';
    })
    .catch((error: unknown) => {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get document original name', err);
      return undefined;
    });
};

export const getDocumentUpdateDate = async (filePath: string): Promise<string> => {
  const fileRef = storageRef(firebaseStorage, filePath);
  const { updated } = await getMetadata(fileRef);

  return getDateTime(updated);
};

export const getDocumentUploadDate = async (filePath: string): Promise<string> => {
  const fileRef = storageRef(firebaseStorage, filePath);
  const { timeCreated } = await getMetadata(fileRef);

  return getDateTime(timeCreated);
};

export const getFirebaseDownloadUrl = (filePath: string): Promise<string | undefined> => {
  const fileRef = storageRef(firebaseStorage, filePath);

  return getDownloadURL(fileRef)
    .then((url: string) => {
      return url;
    })
    .catch((error: unknown) => {
      const err = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get download URL', err);
      return undefined;
    });
};

export const getFilename = (documentUrl: string, includeExtension = true): string => {
  const urlSplit = documentUrl.split('/');
  const filenameWithExtension = urlSplit[urlSplit.length - 1] || '';

  if (!includeExtension) {
    return filenameWithExtension.split('.')[0];
  }

  return filenameWithExtension;
};

export const getFileExtension = (documentUrl: string): string => {
  const urlSplit = documentUrl.split('/');
  const filenameWithExtension = urlSplit[urlSplit.length - 1] || '';

  return filenameWithExtension.split('.')[1].toLocaleLowerCase();
};

export const getFirstName = (user?: User): string => {
  if (user) {
    return user?.displayName?.split(' ')[0] || '';
  }

  return '';
};

export const getLastName = (user?: User): string => {
  if (user) {
    const splitDisplayName = user?.displayName?.split(' ');
    if (splitDisplayName?.length == 2) {
      return splitDisplayName[1];
    }

    const multiWordNameParts = splitDisplayName?.slice(1);

    return multiWordNameParts?.join(' ') || '';
  }

  return '';
};

export default firebaseApp;
