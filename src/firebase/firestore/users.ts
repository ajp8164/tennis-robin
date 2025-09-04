import { getApp } from '@react-native-firebase/app';
import getFirestore, {
  FirebaseFirestoreTypes,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';
import { DateTime } from 'luxon';
import { UserProfile } from 'types/user';

import {
  CollectionChangeListenerOptions,
  QueryOrderBy,
  QueryResult,
  QueryWhere,
  collectionChangeListener,
  documentChangeListener,
  getDocument,
  getDocuments,
} from './index';

export const getUser = (id: string): Promise<UserProfile | undefined> => {
  return getDocument('Users', id);
};

export const getUsers = (opts?: {
  limit?: number;
  lastDocument?: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;
  orderBy?: QueryOrderBy;
  where?: QueryWhere[];
  fromCache?: boolean;
}): Promise<QueryResult<UserProfile>> => {
  const {
    lastDocument,
    limit = 10,
    orderBy = { fieldPath: 'name', directionStr: 'asc' },
    where,
    fromCache = false,
  } = opts || {};
  return getDocuments('Users', {
    lastDocument,
    orderBy,
    limit,
    where,
    fromCache,
  });
};
export const addUser = async (user: UserProfile): Promise<UserProfile> => {
  const app = getApp();
  const db = getFirestore(app);

  const added = { ...user }; // Don't mutate input
  const id = added.id;
  if (!id) throw 'Failed to add user: no id';

  delete (added as Partial<UserProfile>).id; // Remove id from object before storing

  added.createdOn = DateTime.now().toISODate();

  const docRef: FirebaseFirestoreTypes.DocumentReference<Partial<UserProfile>> =
    doc(db, 'Users', id);

  try {
    await setDoc(docRef, added);
    return user;
  } catch (e) {
    if (e instanceof Error) {
      log.error(`Failed to add user document: ${e.message}`);
    } else {
      log.error(`Failed to add user document: ${String(e)}`);
    }
    throw e;
  }
};

export const updateUser = (user: UserProfile): Promise<UserProfile> => {
  const app = getApp();
  const db = getFirestore(app);

  const updated = { ...user }; // Don't mutate input
  const id = updated.id;
  if (!id) throw 'Failed to update user: no id';

  delete (updated as Partial<UserProfile>).id; // Remove id from object before storing

  const docRef: FirebaseFirestoreTypes.DocumentReference<Partial<UserProfile>> =
    doc(db, 'Users', id);

  return updateDoc(docRef, updated)
    .then(() => user)
    .catch((e: unknown) => {
      if (e instanceof Error) {
        log.error(`Failed to update user document: ${e.message}`);
      } else {
        log.error(`Failed to update user document: ${String(e)}`);
      }
      throw e;
    });
};

export const deleteUser = (id: string): Promise<void> => {
  const app = getApp();
  const db = getFirestore(app);

  const docRef: FirebaseFirestoreTypes.DocumentReference = doc(db, 'Users', id);

  return deleteDoc(docRef).catch((e: unknown) => {
    if (e instanceof Error) {
      log.error(`Failed to delete user document: ${e.message}`);
    } else {
      log.error(`Failed to delete user document: ${String(e)}`);
    }
    throw e;
  });
};

export const usersCollectionChangeListener = (
  handler: (
    snapshot: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => void,
  opts?: Omit<CollectionChangeListenerOptions, 'subCollection'>,
): (() => void) => {
  opts = {
    orderBy: { fieldPath: 'name', directionStr: 'asc' },
    ...opts,
  } as CollectionChangeListenerOptions;
  return collectionChangeListener('Users', handler, opts);
};

export const usersDocumentChangeListener = (
  documentPath: string,
  handler: (
    snapshot: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => void,
): (() => void) => {
  return documentChangeListener('Users', documentPath, handler);
};
