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

export const resetPassword = (code: string, newPassword: string) => {
  return confirmPasswordReset(firebaseAuth, code, newPassword);
};

export const sendForgotPasswordEmail = (email: string) => {
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

export const signOutUser = () => {
  return fetch('/api/auth', { method: 'DELETE' });
};

export const updateUser = async (user: User, updates: UserUpdates) => {
  if (user) {
    return await updateProfile(user, updates)
      .then(() => {
        console.debug('User updated');
      })
      .catch(error => {
        const err = error as AuthError;
        console.error('Error updating profile', err.message);
      });
  }
};

export const updateUserPassword = async (password: string) => {
  if (firebaseAuth.currentUser) {
    updatePassword(firebaseAuth.currentUser, password)
      .then(() => {
        localStorage.clear();
        return;
      })
      .catch(error => {
        const err = error as AuthError;
        console.error('Error updating password', err.message);
      });
  }
};

export const updateUserProfile = async (updates: UserUpdates) => {
  if (firebaseAuth.currentUser) {
    return await updateProfile(firebaseAuth.currentUser, updates).catch(error => {
      const err = error as AuthError;
      console.error('Error updating profile', err.message);
    });
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

export const deleteUserDocument = async (documentPath: string) => {
  const documentRef = storageRef(firebaseStorage, documentPath);

  return deleteObject(documentRef);
};

export const getDocumentDisplayName = (filePath: string) => {
  const fileRef = storageRef(firebaseStorage, filePath);

  return getMetadata(fileRef)
    .then(({ customMetadata }) => {
      return customMetadata?.displayName || '';
    })
    .catch((error: any) => {
      console.error('Failed to get document download URL', error);
      return undefined;
    });
};

export const getDocumentOriginalName = (filePath: string) => {
  const fileRef = storageRef(firebaseStorage, filePath);

  return getMetadata(fileRef)
    .then(({ customMetadata }) => {
      return customMetadata?.originalName || '';
    })
    .catch((error: any) => {
      console.error('Failed to get document original name', error);
      return undefined;
    });
};

export const getDocumentUpdateDate = async (filePath: string) => {
  const fileRef = storageRef(firebaseStorage, filePath);
  const { updated } = await getMetadata(fileRef);

  return getDateTime(updated);
};

export const getDocumentUploadDate = async (filePath: string) => {
  const fileRef = storageRef(firebaseStorage, filePath);
  const { timeCreated } = await getMetadata(fileRef);

  return getDateTime(timeCreated);
};

export const getFirebaseDownloadUrl = (filePath: string) => {
  const fileRef = storageRef(firebaseStorage, filePath);

  return getDownloadURL(fileRef)
    .then((url: string) => {
      return url;
    })
    .catch((error: any) => {
      console.error('Failed to get download URL', error);
      return undefined;
    });
};

export const getFilename = (documentUrl: string, includeExtension = true) => {
  const urlSplit = documentUrl.split('/');
  const filenameWithExtension = urlSplit[urlSplit.length - 1] || '';

  if (!includeExtension) {
    return filenameWithExtension.split('.')[0];
  }

  return filenameWithExtension;
};

export const getFileExtension = (documentUrl: string) => {
  const urlSplit = documentUrl.split('/');
  const filenameWithExtension = urlSplit[urlSplit.length - 1] || '';

  return filenameWithExtension.split('.')[1].toLocaleLowerCase();
};

export const getFirstName = (user?: User) => {
  if (user) {
    return user?.displayName?.split(' ')[0] || '';
  }

  return '';
};

export const getLastName = (user?: User) => {
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
