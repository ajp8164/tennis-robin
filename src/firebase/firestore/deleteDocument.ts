import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  FirebaseFirestoreTypes,
  deleteDoc,
  getFirestore,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';

export const deleteDocument = async (path: string, id: string) => {
  const app = getApp();
  const db = getFirestore(app);

  const docRef: FirebaseFirestoreTypes.DocumentReference = FSDoc(db, path, id);

  try {
    await deleteDoc(docRef);
    log.debug(`firestore - deleteDocument: ${path}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e instanceof Error) {
      log.error(`Failed to delete document at path ${path}: ${e.message}`);
    } else {
      log.error(`Failed to delete document at path ${path}: ${String(e)}`);
    }
    throw e;
  }
};
