import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  FirebaseFirestoreTypes,
  Unsubscribe,
  getFirestore,
  onSnapshot,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';

import { addFirestoreSubscription } from './subscriptions';

export const documentChangeListener = <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  documentPath: string,
  handler: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<T>) => void,
): Unsubscribe => {
  const app = getApp();
  const db = getFirestore(app);

  const docRef: FirebaseFirestoreTypes.DocumentReference<T> = FSDoc(
    db,
    collectionPath,
    documentPath,
  ) as FirebaseFirestoreTypes.DocumentReference<T>;

  const unsubscribe = onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    handler,
    (e: unknown) => {
      if (
        e instanceof Error &&
        !e.message.includes('firestore/permission-denied')
      ) {
        log.error(
          `Failed onSnapshot for ${collectionPath}.${documentPath} document: ${e.message}`,
        );
      }
    },
  );

  addFirestoreSubscription(unsubscribe, collectionPath);
  return unsubscribe;
};
