import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  FirebaseFirestoreTypes,
  getFirestore,
  updateDoc,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';
import { DateTime } from 'luxon';

import { WithId } from './index';

export const updateDocument = async <T>(path: string, doc: T) => {
  const app = getApp();
  const db = getFirestore(app);

  const updated = <WithId<T>>{ ...doc }; // Don't mutate input
  const id = updated.id;
  if (!id) throw `Failed to update document at path ${path}: no id`;

  delete (updated as Partial<WithId<T>>).id; // Remove id from object before storing

  updated.updatedOn = DateTime.now().toISO();

  const docRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> =
    FSDoc(db, path, id);

  try {
    await updateDoc(docRef, updated);
    log.debug(`firestore - updateDocument: ${path}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e instanceof Error) {
      log.error(`Failed to update document at path ${path}: ${e.message}`);
    } else {
      log.error(`Failed to update document at path ${path}: ${String(e)}`);
    }
    throw e;
  }
};
