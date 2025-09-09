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

import { QueryOrderBy, QueryResult, QueryWhere } from './index';

const whereInChunkSize = 10; // Firestore limit

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
  const { orderBy, limit, lastDocument, skipIdMap, where, fromCache } =
    opts || {};

  const app = getApp();
  const db = getFirestore(app);

  try {
    const whereInChunks: QueryFieldFilterConstraint[] = [];

    let q: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> =
      collection(db, collectionPath);

    // Apply where filters
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
          q = firestoreQuery(q, firestoreWhere(w.fieldPath, w.opStr, w.value));
        }
      });

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
        q = firestoreQuery(q, firestoreOrderBy(o.fieldPath, o.directionStr));
      });
    }

    // Apply pagination
    if (lastDocument) {
      q = firestoreQuery(q, startAfter(lastDocument));
    }

    // Apply limit (+1 to detect end)
    if (limit) {
      q = firestoreQuery(q, firestoreLimit(limit + 1));
    }

    const getDocsFn = fromCache ? getDocsFromCache : getDocs;

    let docCount = 0;
    let lastDocRead = {} as FirebaseFirestoreTypes.DocumentData;
    let querySnapshot = {} as FirebaseFirestoreTypes.QuerySnapshot<T>;
    const result: T[] = [];

    if (whereInChunks.length) {
      // Chunked query.
      for (const wiChunk of whereInChunks) {
        querySnapshot = await getDocsFn(firestoreQuery(q, wiChunk));

        docCount += querySnapshot.docs.length;
        lastDocRead = querySnapshot.docs[querySnapshot.docs.length - 1];

        result.push(
          ...querySnapshot.docs.map(d => ({
            id: skipIdMap ? undefined : d.id,
            ...d.data(),
          })),
        );
      }
    } else {
      // Single query.
      querySnapshot = await getDocsFn(q);

      docCount += querySnapshot.docs.length;
      lastDocRead = querySnapshot.docs[querySnapshot.docs.length - 1];

      result.push(
        ...querySnapshot.docs.map(d => ({
          id: skipIdMap ? undefined : d.id,
          ...d.data(),
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
