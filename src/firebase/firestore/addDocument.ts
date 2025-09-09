import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  FirebaseFirestoreTypes,
  collection,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';

import { WithId } from './index';

export const addDocument = async <T>(path: string, doc: T) => {
  try {
    const app = getApp();
    const db = getFirestore(app);

    const added = <WithId<T>>{ ...doc }; // Don't mutate input
    delete (added as Partial<WithId<T>>).id; // Remove id from object before storing

    const docRef: FirebaseFirestoreTypes.DocumentReference<Partial<WithId<T>>> =
      FSDoc(collection(db, path));

    await setDoc(docRef, added);
  } catch (e) {
    if (e instanceof Error) {
      log.error(`Failed to add document at path ${path}: ${e.message}`);
    } else {
      log.error(`Failed to add document at path ${path}: ${String(e)}`);
    }
    throw e;
  }
};
