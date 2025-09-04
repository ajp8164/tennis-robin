import { getApp } from '@react-native-firebase/app';
import {
  FirebaseFirestoreTypes,
  collection,
  doc,
  limit as firestoreLimit,
  orderBy as firestoreOrderBy,
  query as firestoreQuery,
  startAfter as firestoreStartAfter,
  where as firestoreWhere,
  getCountFromServer,
  getDoc,
  getDocs,
  getDocsFromCache,
  getFirestore,
  onSnapshot,
  startAfter,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';
import { UserRole } from 'types/user';

import { addFirestoreSubscription } from './subscriptions';

export type ListenerAuth = {
  allowedRoles?: UserRole[];
  userRole?: UserRole;
};

export type QueryResult<T> = {
  allLoaded: boolean;
  lastDocument: FirebaseFirestoreTypes.DocumentData;
  result: T[];
  snapshot: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>;
};

export type QueryOrderBy = {
  fieldPath: string | FirebaseFirestoreTypes.FieldPath;
  directionStr?: 'asc' | 'desc' | undefined;
};

export type QueryWhere = {
  fieldPath: string | FirebaseFirestoreTypes.FieldPath;
  opStr: FirebaseFirestoreTypes.WhereFilterOp;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

export type CollectionChangeListenerOptions = {
  lastDocument?: FirebaseFirestoreTypes.DocumentData;
  limit?: number;
  orderBy?: QueryOrderBy;
  where?: QueryWhere[];
  subCollection?: {
    documentPath: string;
    name: string;
  };
  auth?: ListenerAuth;
};

export const getDocument = async <T>(
  collectionPath: string,
  id: string,
): Promise<T | undefined> => {
  const app = getApp();
  const db = getFirestore(app);

  try {
    const docRef = doc(db, collectionPath, id);
    const documentSnapshot = await getDoc(docRef);
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

export const getDocuments = async <T extends { id?: string }>(
  collectionPath: string,
  opts?: {
    orderBy?: QueryOrderBy;
    limit?: number;
    where?: QueryWhere[];
    lastDocument?: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;
    skipIdMap?: boolean;
    fromCache?: boolean;
  },
): Promise<QueryResult<T>> => {
  const {
    orderBy,
    limit = 1,
    lastDocument,
    skipIdMap,
    where,
    fromCache,
  } = opts || {};

  const db = getFirestore(getApp());
  let q: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> =
    collection(db, collectionPath);

  // Apply where filters
  if (where) {
    where.forEach(w => {
      q = firestoreQuery(q, firestoreWhere(w.fieldPath, w.opStr, w.value));
    });
  }

  // Apply orderBy
  if (orderBy) {
    q = firestoreQuery(
      q,
      firestoreOrderBy(orderBy.fieldPath, orderBy.directionStr),
    );
  }

  // Apply pagination
  if (lastDocument) {
    q = firestoreQuery(q, startAfter(lastDocument));
  }

  // Apply limit (+1 to detect end)
  q = firestoreQuery(q, firestoreLimit(limit + 1));

  try {
    const getDocsFn = fromCache ? getDocsFromCache : getDocs;

    const querySnapshot = await getDocsFn(q);
    const result: T[] = [];

    querySnapshot.forEach(
      (
        doc: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
        index: number,
      ) => {
        if (index < limit) {
          const data = doc.data() as T;
          if (!skipIdMap) data.id = doc.id;
          result.push(data);
        }
      },
    );

    return {
      allLoaded: querySnapshot.docs.length <= limit,
      lastDocument: querySnapshot.docs[querySnapshot.docs.length - 1],
      result,
      snapshot: querySnapshot,
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      log.error(`Failed to get ${collectionPath} documents: ${e.message}`);
    }
    throw e;
  }
};

export const getDocumentCount = async (
  collectionPath: string,
): Promise<number> => {
  const app = getApp();
  const db = getFirestore(app);

  const collRef = collection(db, collectionPath);
  const snapshot = await getCountFromServer(collRef);
  return snapshot.data().count;
};

export const collectionChangeListener = <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  handler: (snapshot: FirebaseFirestoreTypes.QuerySnapshot<T>) => void,
  opts?: CollectionChangeListenerOptions,
): (() => void) => {
  const { lastDocument, limit, orderBy, where, subCollection, auth } =
    opts || {};
  const app = getApp();
  const db = getFirestore(app);

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
    collRef = doc(collRef, subCollection.documentPath).collection(
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
    q = firestoreQuery(
      q,
      firestoreOrderBy(orderBy.fieldPath, orderBy.directionStr),
    );
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

export const documentChangeListener = <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  documentPath: string,
  handler: (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<T>) => void,
): (() => void) => {
  const app = getApp();
  const db = getFirestore(app);

  const docRef: FirebaseFirestoreTypes.DocumentReference<T> = doc(
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
