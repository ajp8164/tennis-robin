import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  FirebaseFirestoreTypes,
  Unsubscribe,
  collection,
  limit as firestoreLimit,
  orderBy as firestoreOrderBy,
  query as firestoreQuery,
  startAfter as firestoreStartAfter,
  where as firestoreWhere,
  getFirestore,
  onSnapshot,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';
import { UserRole } from 'types/user';

import { CollectionChangeListenerOptions } from './index';
import { addFirestoreSubscription } from './subscriptions';

export const collectionChangeListener = <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  handler: (snapshot: FirebaseFirestoreTypes.QuerySnapshot<T>) => void,
  opts?: CollectionChangeListenerOptions,
): Unsubscribe => {
  const { lastDocument, limit, orderBy, where, subCollection, auth } =
    opts || {};
  const app = getApp();
  const db = getFirestore(app);

  // Authentication check
  // This listener will not setup if the user is not authenticated.
  const currentUser = app.auth().currentUser;
  if (!currentUser) {
    return () => {};
  }

  // Permission check
  if (auth) {
    auth.allowedRoles = auth.allowedRoles || [
      UserRole.Admin,
      UserRole.Owner,
      UserRole.User,
    ];
    if (!auth.userRole || !auth.allowedRoles.includes(auth.userRole)) {
      return () => {};
    }
  }

  // Base collection
  let collRef:
    | FirebaseFirestoreTypes.CollectionReference<T>
    | FirebaseFirestoreTypes.Query<T> = collection(
    db,
    collectionPath,
  ) as FirebaseFirestoreTypes.CollectionReference<T>;

  // Subcollection
  if (subCollection) {
    collRef = FSDoc(collRef, subCollection.documentPath).collection(
      subCollection.name,
    ) as FirebaseFirestoreTypes.CollectionReference<T>;
  }

  // Apply filters
  let q: FirebaseFirestoreTypes.Query<T> = collRef;
  if (where) {
    where.forEach(w => {
      q = firestoreQuery(q, firestoreWhere(w.fieldPath, w.opStr, w.value));
    });
  }

  if (orderBy) {
    orderBy.forEach(o => {
      q = firestoreQuery(q, firestoreOrderBy(o.fieldPath, o.directionStr));
    });
  }

  if (limit) {
    q = firestoreQuery(q, firestoreLimit(limit));
  }

  if (lastDocument) {
    q = firestoreQuery(q, firestoreStartAfter(lastDocument));
  }

  // Listen to changes
  const unsubscribe = onSnapshot(
    q,
    { includeMetadataChanges: true },
    handler,
    (e: unknown) => {
      if (
        e instanceof Error &&
        !e.message.includes('firestore/permission-denied')
      ) {
        log.error(
          `Failed onSnapshot for ${collectionPath} collection: ${e.message}`,
        );
      }
    },
  );

  addFirestoreSubscription(unsubscribe, collectionPath);
  return unsubscribe;
};
