import { useEffect, useState } from 'react';

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import {
  CollectionChangeListenerOptions,
  collectionChangeListener,
} from './index';

export const useCollection = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionPath: string,
  opts?: CollectionChangeListenerOptions,
  deps?: React.DependencyList,
) => {
  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const optsStr = JSON.stringify(opts);

  useEffect(() => {
    let ready = true;
    if (deps) {
      ready = deps?.every((v): v is NonNullable<typeof v> => v != null);
    }
    if (!ready) return;

    // If the query options change we need to reload on the new query.
    setLoading(true);

    const unsubscribe = collectionChangeListener<T>(
      collectionPath,
      documents => {
        setDocuments(documents);
        setLoading(false);
      },
      opts,
    );

    return unsubscribe;
    // Only options changes cause updates. Use a stringified object since the
    // opts object is new on every render and causes an endless loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optsStr]);

  return {
    docs: documents,
    loading,
  };
};
