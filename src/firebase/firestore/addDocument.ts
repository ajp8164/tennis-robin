import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  FirebaseFirestoreTypes,
  collection,
  getDoc,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';
import { DateTime } from 'luxon';

import { WithId } from './index';

export const addDocument = async <T>(
  path: string,
  doc: T,
  opts?: {
    id?: string;
  },
) => {
  const { id } = opts || {};

  try {
    const app = getApp();
    const db = getFirestore(app);

    const added = <WithId<T>>{ ...doc }; // Don't mutate input
    delete (added as Partial<WithId<T>>).id; // Remove id from object before storing

    const now = DateTime.now().toISO();
    added.createdOn = now;
    added.updatedOn = now;
    added.archivedOn = null;

    let docRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> =
      FSDoc(collection(db, path));

    if (id) {
      docRef = FSDoc(db, path, id);
    }

    await setDoc(docRef, added);
    const snapshot = await getDoc(docRef);
    log.debug(`firestore - addDocument: ${path}`);

    return { id: snapshot.id, ...snapshot.data() } as T;
  } catch (e) {
    if (e instanceof Error) {
      log.error(`Failed to add document at path ${path}: ${e.message}`);
    } else {
      log.error(`Failed to add document at path ${path}: ${String(e)}`);
    }
    throw e;
  }
};
