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
      options,
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  return {
    docs: documents,
    setOpts: setOptions,
  };
};
