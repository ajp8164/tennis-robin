import { getApp } from '@react-native-firebase/app';
import {
  doc as FSDoc,
  FirebaseFirestoreTypes,
  FirestoreError,
  QueryFieldFilterConstraint,
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
import { AppError } from 'lib/errors';
import { UserRole } from 'types/user';

import {
  CollectionChangeListenerOptions,
  QueryWithMeta,
  WithId,
  whereInChunkSize,
} from './index';
import { addFirestoreSubscription } from './subscriptions';

export const collectionChangeListener = <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  handler: (documents: WithId<T>[]) => void,
  opts?: CollectionChangeListenerOptions,
): Unsubscribe | undefined => {
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

  const q: QueryWithMeta = {
    query: collRef,
    orderBy: [],
  };

  // Apply where filters
  const whereInChunks: QueryFieldFilterConstraint[] = [];
  const whereNotArchived = firestoreWhere('archivedOn', '==', null);

  if (where) {
    let noQuery = false;

    where.forEach(w => {
      // Check for whereIn operation. Firestore enforces a limit to the length of
      // the value array (whereInChunkSize). We need to break the query in to chunks
      // and assemble the results as queries are processed.
      //
      // These where-filter operations are subject to the limit.
      if (['in', 'array-contains-any'].includes(w.opStr)) {
        // Short circuit a whereIn filter that will return no results (an empty value array).
        if (!w.value.length) {
          noQuery = true;
          return;
        }

        // This implementation allows only one whereIn filter clause. Throw an error
        // if more than one is specified.
        if (whereInChunks.length > 0) {
          throw new AppError(
            'Cannot call collectionChangeListener with multiple where "in" or where "array-contains-any"',
          );
        }

        // Split values into chunks of where-filter clauses.
        for (let i = 0; i < w.value.length; i += whereInChunkSize) {
          whereInChunks.push(
            firestoreWhere(
              w.fieldPath,
              w.opStr,
              w.value.slice(i, i + whereInChunkSize),
            ),
          );
        }
      } else {
        // Not an array filter query.
        q.query = firestoreQuery(
          q.query,
          firestoreWhere(w.fieldPath, w.opStr, w.value),
        );
      }
    });

    // If the where clause would not select any documents then return.
    if (noQuery) {
      handler([]);
      return;
    }
  }

  // Apply orderBy
  if (orderBy) {
    orderBy.forEach(o => {
      q.query = firestoreQuery(
        q.query,
        firestoreOrderBy(o.fieldPath, o.directionStr),
      );

      q.orderBy.push({
        field: o.fieldPath as string,
        direction: o.directionStr,
      });
    });
  }

  // Apply limit (+1 to detect end)
  if (limit) {
    q.query = firestoreQuery(q.query, firestoreLimit(limit + 1));
  }

  if (lastDocument) {
    q.query = firestoreQuery(q.query, firestoreStartAfter(lastDocument));
  }

  const unsubscribes: Unsubscribe[] = [];
  const chunkResults: Record<number, WithId<T>[]> = {};
  const initializedChunks = new Set<number>();

  if (whereInChunks.length) {
    whereInChunks.forEach((chunk, idx) => {
      // Pagination (lastDocument/limit) and orderBy are not used in the chunked query.
      // Ordering is done after all chunks are assembled. Pagination must be handled in
      // some other way (e.g. additional where clauses).
      let qC = firestoreQuery(collection(db, collectionPath), chunk);

      // Always select from unarchived documents.
      qC = firestoreQuery(qC, whereNotArchived);

      const unsubscribe = onSnapshot(
        qC,
        (snapshot: FirebaseFirestoreTypes.QuerySnapshot<T>) => {
          log.debug(
            `firestore - useCollection: ${collectionPath} chunk ${idx} (from cache = ${snapshot.metadata.fromCache})`,
          );

          // Update this chunk’s results.
          chunkResults[idx] = snapshot.docs.map(
            doc => ({ id: doc.id, ...doc.data() }) as WithId<T>,
          );

          initializedChunks.add(idx);

          // Wait until all chunks have emitted at least once.
          if (initializedChunks.size === whereInChunks.length) {
            const merged = Object.values(chunkResults).flat();

            // Apply orderBy. Chunked queries cannot be ordered on the server so we
            // use the orderBy filter to sort here. Sort asc unless desc is specified.
            q.orderBy.forEach(ob => {
              merged.sort((a, b) => {
                if (a[ob.field] < b[ob.field])
                  return ob.direction === 'desc' ? 1 : -1;
                if (a[ob.field] > b[ob.field])
                  return ob.direction === 'desc' ? -1 : 1;
                return 0;
              });
            });

            handler(merged);
          }
        },
        (e: FirestoreError) => {
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
      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(u => u());
  } else {
    // Not a chunked snapshot.
    // Always select from unarchived documents.
    q.query = firestoreQuery(q.query, whereNotArchived);

    const unsubscribe = onSnapshot(
      q.query,
      { includeMetadataChanges: true },
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot<T>) => {
        log.debug(
          `firestore - useCollection: ${collectionPath} (from cache = ${snapshot.metadata.fromCache})`,
        );

        const documents: WithId<T>[] = [];
        if (snapshot.size) {
          snapshot.forEach(doc => {
            documents.push({ id: doc.id, ...doc.data() } as WithId<T>);
          });
        }
        handler(documents);
      },
      (e: FirestoreError) => {
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

    return unsubscribe;
  }
};
