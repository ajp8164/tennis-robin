import { useEffect, useState } from 'react';

import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  FirebaseFirestoreTypes,
  Unsubscribe,
  collection,
  deleteDoc,
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
  setDoc,
  startAfter,
  updateDoc,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';
import { UserRole } from 'types/user';

import { addFirestoreSubscription } from './subscriptions';

export type WithId<T> = T & { id: string };

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
  orderBy?: QueryOrderBy[];
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
    const docRef = FSDoc(db, collectionPath, id);
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
    orderBy?: QueryOrderBy[];
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
    orderBy.forEach(o => {
      q = firestoreQuery(q, firestoreOrderBy(o.fieldPath, o.directionStr));
    });
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

export const useCollection = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionPath: string,
  opts?: CollectionChangeListenerOptions,
) => {
  const [documents, setDocuments] = useState<T[]>([]);
  const [options, setOptions] = useState<
    CollectionChangeListenerOptions | undefined
  >(opts);

  useEffect(() => {
    const unsubscribe = collectionChangeListener<T>(
      collectionPath,
      snapshot => {
        const documents: T[] = [];
        if (snapshot.size) {
          snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() } as T);
          });
        }
        setDocuments(documents);
      },
      opts,
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return {
    docs: documents,
    setOpts: setOptions,
  };
};

export const useDocument = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionPath: string,
  documentPath?: string,
) => {
  const [document, setDocument] = useState<WithId<T>>();

  // Fetch once on mount or when path changes
  useEffect(() => {
    if (!documentPath) return;

    getDocument<WithId<T>>(collectionPath, documentPath).then(doc => {
      if (doc) {
        setDocument(doc);
      }
    });
  }, [collectionPath, documentPath]);

  // Subscribe to live updates
  useEffect(() => {
    if (!documentPath) return;

    const unsubscribe = documentChangeListener<T>(
      collectionPath,
      documentPath,
      snapshot => {
        if (snapshot.exists()) {
          setDocument({ id: snapshot.id, ...snapshot.data() } as WithId<T>);
        } else {
          setDocument(undefined);
        }
      },
    );
    return unsubscribe;
  }, [collectionPath, documentPath]);

  return { doc: documentPath ? document : undefined };
};

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

export const updateDocument = async <T>(path: string, doc: T) => {
  const app = getApp();
  const db = getFirestore(app);

  const updated = <WithId<T>>{ ...doc }; // Don't mutate input
  const id = updated.id;
  if (!id) throw `Failed to update document at path ${path}: no id`;

  delete (updated as Partial<WithId<T>>).id; // Remove id from object before storing

  const docRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> =
    FSDoc(db, path, id);

  try {
    await updateDoc(docRef, updated);
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

export const deleteDocument = async (path: string, id: string) => {
  const app = getApp();
  const db = getFirestore(app);

  const docRef: FirebaseFirestoreTypes.DocumentReference = FSDoc(db, path, id);

  try {
    await deleteDoc(docRef);
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
