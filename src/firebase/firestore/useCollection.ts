import { useEffect, useState } from 'react';

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import {
  CollectionChangeListenerOptions,
  collectionChangeListener,
} from './index';

export const useCollection = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionPath: string,
  opts?: CollectionChangeListenerOptions,
) => {
  const [documents, setDocuments] = useState<T[]>([]);
  const optsStr = JSON.stringify(opts);

  useEffect(() => {
    const unsubscribe = collectionChangeListener<T>(
      collectionPath,
      // snapshot => {
      //   const documents: T[] = [];
      //   if (snapshot.size) {
      //     snapshot.forEach(doc => {
      //       documents.push({ id: doc.id, ...doc.data() } as T);
      //     });
      //   }
      //   setDocuments(documents);
      // },
      documents => setDocuments(documents),
      opts,
    );

    return unsubscribe;
    // Only options changes cause updates. Use a stringified object since the
    // opts object is new on every render and causes an endless loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optsStr]);

  return {
    docs: documents,
  };
};
