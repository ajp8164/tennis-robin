import { getApp } from '@react-native-firebase/app';
import {
  FirebaseFirestoreTypes,
  QueryFieldFilterConstraint,
  collection,
  limit as firestoreLimit,
  orderBy as firestoreOrderBy,
  query as firestoreQuery,
  where as firestoreWhere,
  getDocs,
  getDocsFromCache,
  getFirestore,
  startAfter,
} from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';
import { AppError } from 'lib/errors';

import {
  QueryOrderBy,
  QueryResult,
  QueryWhere,
  QueryWithMeta,
  WithId,
  whereInChunkSize,
} from './index';

export const getDocuments = async <
  T extends FirebaseFirestoreTypes.DocumentData,
>(
  collectionPath: string,
  opts?: {
    orderBy?: QueryOrderBy[];
    limit?: number;
    where?: QueryWhere[];
    lastDocument?: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>;
    fromCache?: boolean;
  },
): Promise<QueryResult<T>> => {
  const { orderBy, limit, lastDocument, where, fromCache } = opts || {};

  const app = getApp();
  const db = getFirestore(app);

  try {
    const collRef: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> =
      collection(db, collectionPath);

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
              'Cannot call getDocuments with multiple where "in" or where "array-contains-any"',
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

      // If the where clause would not select any documents then return;
      if (noQuery) {
        return {
          allLoaded: true,
          lastDocument: undefined,
          result: [],
          snapshot: undefined,
        };
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

    // Apply pagination
    if (lastDocument) {
      q.query = firestoreQuery(q.query, startAfter(lastDocument));
    }

    // Apply limit (+1 to detect end)
    if (limit) {
      q.query = firestoreQuery(q.query, firestoreLimit(limit + 1));
    }

    const getDocsFn = fromCache ? getDocsFromCache : getDocs;

    let docCount = 0;
    let lastDocRead = {} as FirebaseFirestoreTypes.DocumentData;
    let querySnapshot = {} as FirebaseFirestoreTypes.QuerySnapshot<T>;
    const result: WithId<T>[] = [];

    if (whereInChunks.length) {
      // Chunked query.
      // Always select from unarchived documents.
      q.query = firestoreQuery(q.query, whereNotArchived);

      for (const wiChunk of whereInChunks) {
        querySnapshot = await getDocsFn(firestoreQuery(q.query, wiChunk));
        log.debug(
          `firestore - getDocuments: ${collectionPath} (from cache = ${querySnapshot.metadata.fromCache})`,
        );

        docCount += querySnapshot.docs.length;
        lastDocRead = querySnapshot.docs[querySnapshot.docs.length - 1];

        result.push(
          ...querySnapshot.docs.map(d => ({
            ...d.data(),
            id: d.id,
          })),
        );
      }

      // Apply orderBy. Chunked queries cannot be ordered on the server so we
      // use the orderBy filter to sort here. Sort asc unless desc is specified.
      q.orderBy.forEach(ob => {
        result.sort((a, b) => {
          if (a[ob.field] < b[ob.field])
            return ob.direction === 'desc' ? 1 : -1;
          if (a[ob.field] > b[ob.field])
            return ob.direction === 'desc' ? -1 : 1;
          return 0;
        });
      });
    } else {
      // Single query.
      // Always select from unarchived documents.
      q.query = firestoreQuery(q.query, whereNotArchived);

      querySnapshot = await getDocsFn(q.query);
      log.debug(
        `firestore - getDocuments: ${collectionPath} (from cache = ${querySnapshot.metadata.fromCache})`,
      );

      docCount += querySnapshot.docs.length;
      lastDocRead = querySnapshot.docs[querySnapshot.docs.length - 1];

      result.push(
        ...querySnapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
        })),
      );
    }

    return {
      allLoaded: limit ? docCount <= limit : true,
      // With a chunked query the last document read is in the last chunk.
      lastDocument: lastDocRead,
      result,
      // The snapshot is not discernable when chunking the query.
      snapshot: whereInChunks.length ? undefined : querySnapshot,
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      log.error(`Failed to get ${collectionPath} documents: ${e.message}`);
    }
    throw e;
  }
};
