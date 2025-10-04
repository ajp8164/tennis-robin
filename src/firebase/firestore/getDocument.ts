import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  getDoc,
  getFirestore,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';

export const getDocument = async <T>(
  collectionPath: string,
  id: string,
): Promise<T | undefined> => {
  const app = getApp();
  const db = getFirestore(app);

  try {
    const docRef = FSDoc(db, collectionPath, id);
    const documentSnapshot = await getDoc(docRef);
    log.debug(`firestore - getDocument: ${collectionPath}`);

    if (documentSnapshot.exists()) {
      const result = {
        ...documentSnapshot.data(),
        id,
      };
      return result as T;
    } else {
      return;
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      log.error(`Failed to get ${collectionPath} document: ${e.message}`);
    }
    throw e;
  }
};
